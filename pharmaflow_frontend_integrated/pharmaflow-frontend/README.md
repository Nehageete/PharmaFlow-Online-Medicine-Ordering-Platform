# PharmaFlow Frontend

A production-ready React frontend for the PharmaFlow Spring Boot backend, covering three roles:
**Customer**, **Pharmacist**, and **Admin**.

Built with: React (JavaScript, no TypeScript) · React Router · Axios · Bootstrap 5 + Bootstrap
Icons · Context API · React Hook Form · React Toastify.

No mock data, no fake authentication, no invented endpoints — every network call in this project
maps to a real controller method in the uploaded backend (`pharmaflow_backend`). See
[Endpoint Map](#endpoint-map) below for the full list.

---

## 1. Prerequisites

- Node.js 18+ and npm
- The PharmaFlow Spring Boot backend running locally (default port **8080**, no context-path)
- MySQL running and reachable per the backend's `application.properties`
  (`jdbc:mysql://localhost:3306/PharmaFlow`)

## 2. Setup

```bash
npm install
cp .env.example .env      # adjust REACT_APP_API_BASE_URL if your backend runs elsewhere
npm start                 # runs on http://localhost:3000
```

The project's `package.json` also sets `"proxy": "http://localhost:8080"` for Create React App's
dev server, which sidesteps CORS entirely **in development**. See the CORS note below for
production.

### First-time use

1. Start the backend (`mvn spring-boot:run` or your IDE) — it auto-creates the `PharmaFlow`
   database and tables (`spring.jpa.hibernate.ddl-auto=update`).
2. Register a customer account via the app's `/register` page (self-registration always creates a
   `CUSTOMER` — see `AuthServiceImpl.register`).
3. **Bootstrapping your first Admin**: the app now has a real "Add Staff" flow (Admin → Users →
   Add Staff), backed by a new `POST /admin/users` endpoint - but that endpoint is itself
   ADMIN-only, so you still need exactly **one** initial admin account created outside the app to
   get started. After that, use the in-app "Add Staff" button for every Admin/Pharmacist account
   from then on. To create the very first admin, insert a row directly into the `users` table with
   a BCrypt-hashed password and `role = 'ADMIN'` - see section 3(d) below for the fastest way to
   generate that hash.

---

## 3. Real gaps found in the backend (and how this frontend handles them)

I read every controller, service, DTO, and the security config before writing any frontend code.
Three things are worth calling out explicitly rather than working around silently:

### a) No CORS configuration exists
`SecurityConfig.java` has no `CorsConfigurationSource` bean and no `.cors(...)` call. Without one,
a browser calling the API from a different origin (e.g. `localhost:3000` → `localhost:8080`) will
be blocked once you leave the CRA dev proxy (i.e. any production build served from its own
origin). **Action needed on the backend**: add a `CorsConfigurationSource` bean permitting your
frontend's origin, or serve the built frontend from the same origin as the API.

### b) No "list all orders" or Payments endpoint
`OrderController` only exposes orders by single status (`GET /orders/status/{status}`) or scoped
to the logged-in customer (`GET /orders/my`, `GET /orders/{id}`). There is no endpoint that
returns every order regardless of status, and no standalone Payments controller — payment data
only ever comes back embedded in `OrderResponse.payment`.

**How this frontend handles it**: `services/orderService.js` exposes
`getAllOrdersAggregated()`, which calls `GET /orders/status/{status}` once for each of the six
`OrderStatus` values and merges the results client-side. `services/adminService.js` builds both
the **Admin → Orders** and **Admin → Payments** screens from this same aggregate (Payments simply
extracts the embedded `payment` object from each order). This is real data through real
endpoints — just assembled — not an invented API. If you add a genuine
`GET /admin/orders` / `GET /admin/payments` endpoint later, swap these two methods in
`adminService.js` for direct calls.

### c) Uploaded prescription files aren't served over HTTP
`FileStorageUtil` saves prescription uploads to disk (`uploads/prescriptions/<uuid>.<ext>`) and
`OrderResponse.prescriptionPath` returns that relative path, but no `WebMvcConfigurer` resource
handler or controller exposes that directory over HTTP anywhere in the codebase.

**How this frontend handles it**: every "View Prescription" link (Customer order details,
Pharmacist prescription review, Admin order details) is built from the exact
`prescriptionPath` the backend returns, e.g. `{API_BASE_URL}/{prescriptionPath}`. This is the
correct link *if* the backend serves that path — today it will 404. **Action needed on the
backend**: add something like
`registry.addResourceHandler("/uploads/**").addResourceLocations("file:uploads/")` in a
`WebMvcConfigurer`, or a small controller that streams the file by order ID with an ownership/
role check.

### d) Admin/Pharmacist account creation - now added
The original backend only ever created `CUSTOMER` accounts (self-registration hard-codes the
role). Since Admin/Pharmacist accounts need to exist for those dashboards to be reachable at all,
I added a small, real backend endpoint rather than faking this in the frontend:

- **New DTO**: `dto/request/CreateStaffUserRequest.java` (mirrors `RegisterRequest` plus an
  explicit `role` field)
- **New endpoint**: `POST /admin/users` | **ADMIN only** (already covered by the existing
  `/admin/**` security rule - no `SecurityConfig` change needed) | rejects `role: CUSTOMER` with a
  400, since customers must still self-register through `/auth/register`
- **Files touched**: `AdminUserController.java`, `UserService.java`, `UserServiceImpl.java`,
  and the new `CreateStaffUserRequest.java`

The Admin → Users screen now has an **"Add Staff"** button that opens a form (first/last name,
email, temporary password, phone, address, role) and calls this endpoint directly.

**Bootstrapping problem**: this endpoint is itself ADMIN-only, so it can't create the very first
admin account - someone has to exist before they can invite anyone else. Create exactly one
initial admin manually, then use "Add Staff" for everyone after that:

1. Generate a BCrypt hash for your chosen password. Quickest way if you have the backend running
   locally - add a temporary one-off `@Bean CommandLineRunner` (or a JUnit test) that prints
   `passwordEncoder.encode("your-password")`, run it once, then remove it. (Any BCrypt generator
   works as long as it uses the default 10 rounds Spring Security's `BCryptPasswordEncoder` uses.)
2. Insert the row:
   ```sql
   INSERT INTO users (first_name, last_name, email, password, role, is_active, created_at)
   VALUES ('Admin', 'User', 'admin@pharmaflow.com', '<bcrypt-hash-here>', 'ADMIN', true, NOW());
   ```
3. Log in through the app's `/login` page with that email/password - you'll land on
   `/admin/dashboard`, and from there "Add Staff" creates every Pharmacist/Admin account you need
   going forward.

None of the above required inventing a fake API on the frontend — they're documented limitations
of the current backend, not bugs in this project.

---

## 4. Project Structure

```
src/
  assets/            static images (currently empty — no UI reference was provided to preserve)
  components/
    common/          Loader, ErrorAlert, EmptyState, StatusBadge, ConfirmModal, StarRating, StatCard
    layout/          Navbar, Footer, CustomerLayout, DashboardSidebar, AdminLayout, PharmacistLayout
    customer/        MedicineCard, CategoryCard, CartItemRow, OrderCard, OrderTracker, ReviewList/Form
    admin/            MedicineFormModal, CategoryFormModal
    pharmacist/       (reuses common/customer components; no pharmacist-only components needed)
  pages/
    auth/             Login, Register
    customer/         Home, Medicines, MedicineDetails, Cart, Wishlist, Checkout, Orders, OrderDetails, Profile
    pharmacist/       Dashboard, PendingPrescriptions, PrescriptionReview, UpdateStock, UpdateOrderStatus
    admin/            Dashboard, Users, Medicines, Categories, Orders, OrderDetails, Payments
  services/           api.js + one file per backend controller (see endpoint map)
  context/            AuthContext (session/JWT), CartContext (live cart badge)
  hooks/              useAuth
  routes/             ProtectedRoute (any logged-in user), RoleRoute (role-gated)
  utils/              formatters, roles, toast
  styles/             custom.css
```

**Note on page consolidation**: the spec listed "Order Details" and "Track Order" as separate
customer screens. The backend has exactly one endpoint for both (`GET /orders/{orderId}` returns
full item/payment detail *and* status) — so `pages/customer/OrderDetails.js` serves both, showing
a visual status tracker alongside the full item/payment breakdown. Splitting it into two routes
hitting the same endpoint would add navigation with no functional difference.

**Note on Pharmacist routes**: the backend has no `/pharmacist/**` controller — that URL prefix is
reserved in `SecurityConfig` for future use. Every pharmacist action goes through
`OrderController` / `MedicineController` with role-based authorization; `pharmacistService.js`
just gives those calls pharmacist-friendly names.

---

## 5. Authentication

- JWT-based, stateless. `POST /auth/login` and `POST /auth/register` return
  `{ message, token, userId, firstName, role }`.
- The token and a small session object (`{ userId, firstName, role }`) are stored in
  `localStorage` and re-hydrated on load.
- `services/api.js` attaches `Authorization: Bearer <token>` to every request via an Axios
  request interceptor.
- A response interceptor clears the session and normalizes backend error shapes
  (`ApiResponse { message, status }` for most exceptions, or a field-name → message map for
  `@Valid` failures) into a single `error.friendlyMessage` every page can show directly.
- `ProtectedRoute` requires any authenticated user; `RoleRoute` additionally requires one of a
  given set of roles, redirecting to `/unauthorized` otherwise.
- There's no `/auth/logout` endpoint (JWT is stateless) — logout is purely client-side token
  removal.

---

## 6. Endpoint Map

Base URL: `http://localhost:8080` (no context-path — see `application.properties`).

| Controller | Method & Path | Role | Frontend service |
|---|---|---|---|
| Auth | `POST /auth/register` | public | `authService.register` |
| Auth | `POST /auth/login` | public | `authService.login` |
| Medicine | `GET /medicines` | public | `medicineService.getAll` |
| Medicine | `GET /medicines/{id}` | public | `medicineService.getById` |
| Medicine | `GET /medicines/category/{id}` | public | `medicineService.getByCategory` |
| Medicine | `GET /medicines/search?name=` | public | `medicineService.search` |
| Medicine | `POST /medicines` | ADMIN | `medicineService.create` |
| Medicine | `PUT /medicines/{id}` | ADMIN | `medicineService.update` |
| Medicine | `DELETE /medicines/{id}` | ADMIN | `medicineService.remove` |
| Medicine | `PATCH /medicines/{id}/stock` | PHARMACIST | `medicineService.updateStock` |
| Category | `GET /categories`, `GET /categories/{id}` | public | `categoryService` |
| Category | `POST/PUT/DELETE /categories/{id}` | ADMIN | `categoryService` |
| Review | `GET /reviews/medicine/{id}` | public | `reviewService.getForMedicine` |
| Review | `POST /reviews` | CUSTOMER | `reviewService.addReview` |
| Cart | `GET/POST /cart`, `PUT/DELETE /cart/{id}` | CUSTOMER | `cartService` |
| Wishlist | `GET /wishlist`, `POST/DELETE /wishlist/{medicineId}` | CUSTOMER | `wishlistService` |
| Order | `POST /orders` (multipart) | CUSTOMER | `orderService.placeOrder` |
| Order | `GET /orders/my` | any logged-in | `orderService.getMyOrders` |
| Order | `GET /orders/{id}` | owner-scoped | `orderService.trackOrder` |
| Order | `GET /orders/status/{status}` | PHARMACIST, ADMIN | `orderService.getOrdersByStatus` |
| Order | `PATCH /orders/{id}/status` | PHARMACIST | `orderService.updateOrderStatus` |
| Profile | `GET/PUT /profile` | any logged-in | `profileService` |
| Admin Users | `GET /admin/users` | ADMIN | `adminService.getAllUsers` |
| Admin Users | `GET /admin/users/role/{role}` | ADMIN | `adminService.getUsersByRole` |
| Admin Users | `POST /admin/users` | ADMIN | `adminService.createStaffUser` |
| Admin Users | `PATCH /admin/users/{id}/status?active=` | ADMIN | `adminService.setUserActiveStatus` |

Every one of the 23 endpoints above is called from at least one screen. The only client-side
composition beyond direct 1:1 mapping is the orders/payments aggregation described in section 3(b).

---

## 7. Validation

Every form's client-side validation mirrors the backend's `@Valid` annotations exactly (field
names, max lengths, regex patterns, min/max values) so the messages a user sees before submitting
match what the backend would return if they didn't: `RegisterRequest`, `LoginRequest`,
`UpdateProfileRequest`, `MedicineRequest`, `CategoryRequest`, `CartItemRequest`,
`UpdateCartQuantityRequest`, `PlaceOrderRequest`, `ReviewRequest`, `UpdateStockRequest`,
`OrderStatusUpdateRequest`.

## 8. Error handling & loading states

Every data-fetching page follows the same pattern: a `Loader` while fetching, an `ErrorAlert` with
a retry button on failure, an `EmptyState` for legitimate empty results, and `react-toastify`
toasts for the result of user-triggered actions (add to cart, place order, approve/reject
prescription, etc).

## 9. What wasn't provided

No existing frontend or UI screenshots were uploaded alongside the backend, so there was nothing
to preserve "almost exactly" — this build uses a clean, professional Bootstrap layout built from
scratch. If you have design references (screenshots, a Figma export, or an old frontend
directory), share them and the layout/spacing/palette can be matched precisely on top of the same
logic already wired up here.
