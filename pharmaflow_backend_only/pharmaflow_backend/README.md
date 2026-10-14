# PharmaFlow Backend

Spring Boot 3.5 + JWT backend for the PharmaFlow pharmacy management app.

## Configuration / Secrets

`src/main/resources/application.properties` reads the following environment
variables, falling back to the previous local-dev values if unset, so a plain
`mvn spring-boot:run` on a laptop keeps working with no extra setup:

| Env var | Purpose | Default (local-dev fallback) |
|---|---|---|
| `DB_URL` | MySQL JDBC URL | `jdbc:mysql://localhost:3306/PharmaFlow?...` |
| `DB_USERNAME` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `tad@123` |
| `JWT_SECRET` | HMAC signing key for JWTs | `pharmaflowSecureSecretKeyForJwtSigningChangeThisInProduction123456` |
| `JWT_EXPIRATION` | JWT expiration time in ms | `7200000` (2 hours) |
| `ADMIN_BOOTSTRAP_ENABLED` | enable/disable first-admin seeding (see below) | `true` |
| `PHARMAFLOW_ADMIN_EMAIL` | email of the seeded first admin | `admin@pharmaflow.local` |
| `PHARMAFLOW_ADMIN_PASSWORD` | password of the seeded first admin | `ChangeMe123!` |
| `PHARMAFLOW_ADMIN_FIRST_NAME` / `PHARMAFLOW_ADMIN_LAST_NAME` | seeded admin's name | `System` / `Admin` |

**In any shared, staging, or production environment, always set `DB_PASSWORD`,
`JWT_SECRET`, and the `PHARMAFLOW_ADMIN_*` vars explicitly** — never rely on
the fallback defaults outside a local sandbox.

Example (bash):

```bash
export DB_USERNAME=pharmaflow_app
export DB_PASSWORD='use-a-real-secret-here'
export JWT_SECRET="$(openssl rand -base64 48)"
export PHARMAFLOW_ADMIN_EMAIL=owner@yourpharmacy.com
export PHARMAFLOW_ADMIN_PASSWORD="$(openssl rand -base64 18)"
./mvnw spring-boot:run
```

## Bootstrapping the first admin account

Every admin-only endpoint (e.g. `POST /admin/users`) requires an ADMIN JWT to
call — which creates a chicken-and-egg problem for the very first admin.
Two options are supported:

### Option A (default, automatic): `AdminBootstrapRunner`

`com.pharmaflow.config.AdminBootstrapRunner` is a `CommandLineRunner` that
runs on every application startup:

1. If any user with role `ADMIN` already exists, it does nothing.
2. Otherwise, it creates one ADMIN account using
   `PHARMAFLOW_ADMIN_EMAIL` / `PHARMAFLOW_ADMIN_PASSWORD` (BCrypt-hashed via
   the app's existing `PasswordEncoder` bean), and logs a `WARN`-level banner
   with the login email and a reminder to change the password immediately
   via `PUT /profile/password`.
3. If that email is already taken by a non-admin user, it logs a warning and
   skips (it will never silently overwrite or promote an existing account).

Set `ADMIN_BOOTSTRAP_ENABLED=false` to disable this behavior entirely (e.g.
if you prefer to provision admins purely via Option B, or your deployment
process already guarantees an admin row exists).

### Option B (manual): direct SQL insert

If you'd rather not use the auto-seeder, insert an admin row directly. First
generate a BCrypt hash for your chosen password (10 rounds, matching
`BCryptPasswordEncoder()`'s default), e.g. with the `htpasswd`/`bcrypt` CLI of
your choice, or a one-off `PasswordEncoder` call. Then:

```sql
INSERT INTO users (first_name, last_name, email, password, role, is_active, created_at)
VALUES ('System', 'Admin', 'admin@yourpharmacy.com',
        '$2a$10$REPLACE_WITH_A_REAL_BCRYPT_HASH', 'ADMIN', true, NOW());
```

Log in with that email/password, then use `POST /admin/users` for any
further admin/pharmacist accounts.

## Roadmap / not yet implemented

- **Forgot / reset password flow** (email-based reset link + token) is not
  implemented yet. In the meantime, an admin can reset a user's password by
  recreating their row's `password` hash directly, or a future
  `POST /auth/forgot-password` + `POST /auth/reset-password` pair can be
  added following the same Service/Impl + DTO pattern used elsewhere in this
  codebase (`AuthService`/`AuthServiceImpl`, plus a short-lived reset-token
  table or signed token).
