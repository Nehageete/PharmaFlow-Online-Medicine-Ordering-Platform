import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import CustomerLayout from "./components/layout/CustomerLayout";
import AdminLayout from "./components/layout/AdminLayout";
import PharmacistLayout from "./components/layout/PharmacistLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Home from "./pages/customer/Home";
import Medicines from "./pages/customer/Medicines";
import MedicineDetails from "./pages/customer/MedicineDetails";
import Cart from "./pages/customer/Cart";
import Wishlist from "./pages/customer/Wishlist";
import Checkout from "./pages/customer/Checkout";
import Orders from "./pages/customer/Orders";
import OrderDetails from "./pages/customer/OrderDetails";
import Profile from "./pages/customer/Profile";

import PharmacistDashboard from "./pages/pharmacist/Dashboard";
import PendingPrescriptions from "./pages/pharmacist/PendingPrescriptions";
import PrescriptionReview from "./pages/pharmacist/PrescriptionReview";
import UpdateStock from "./pages/pharmacist/UpdateStock";
import UpdateOrderStatus from "./pages/pharmacist/UpdateOrderStatus";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminMedicines from "./pages/admin/Medicines";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminOrderDetails from "./pages/admin/OrderDetails";
import AdminPayments from "./pages/admin/Payments";
import AdminReports from "./pages/admin/Reports";

import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastContainer />
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Customer-facing storefront - browsing is public, actions require login */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route path="/medicines/:medicineId" element={<MedicineDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />

              <Route element={<RoleRoute roles={["CUSTOMER"]} />}>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Pharmacist workspace */}
            <Route element={<RoleRoute roles={["PHARMACIST"]} />}>
              <Route element={<PharmacistLayout />}>
                <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
                <Route path="/pharmacist/pending-prescriptions" element={<PendingPrescriptions />} />
                <Route path="/pharmacist/pending-prescriptions/:orderId" element={<PrescriptionReview />} />
                <Route path="/pharmacist/update-stock" element={<UpdateStock />} />
                <Route path="/pharmacist/orders" element={<UpdateOrderStatus />} />
              </Route>
            </Route>

            {/* Admin workspace */}
            <Route element={<RoleRoute roles={["ADMIN"]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/medicines" element={<AdminMedicines />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/orders/:orderId" element={<AdminOrderDetails />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/reports" element={<AdminReports />} />
              </Route>
            </Route>

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
