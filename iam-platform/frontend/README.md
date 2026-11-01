# IAM Platform — Frontend Client

Production-grade React frontend application for the **Identity and Access Management (IAM) Platform**, designed with a warm beige, ivory, espresso, and muted sage-green enterprise SaaS aesthetic.

---

## Design System Tokens

| Design Element | Token Hex | Purpose |
| :--- | :--- | :--- |
| **Main Background** | `#F8F5EF` | Warm Ivory page backdrop |
| **Secondary Background** | `#F0E9DE` | Soft Beige cards and secondary containers |
| **Card Background** | `#FFFFFF` | Clean White primary cards |
| **Sidebar Background** | `#EFE7DB` | Persistent soft beige sidebar |
| **Primary Text** | `#302B26` | Deep Espresso Brown |
| **Secondary Text** | `#797168` | Muted neutral description text |
| **Primary Accent** | `#71856B` | Muted Sage Green interactive accents & active states |
| **Accent Hover** | `#53684E` | Deep Sage for hover and focus states |
| **Subtle Borders** | `#E5DDD1` | 1px border dividers |
| **Success State** | `#527A56` | Verified emails, active tokens |
| **Warning State** | `#B78343` | Locked accounts, development previews |
| **Error State** | `#B85C50` | Failed attempts, invalid tokens, destructive actions |
| **Informational Accent** | `#6F8798` | Audit markers, metadata tags |

### Typography
- **Primary Body Font**: `Inter` (tables, inputs, buttons, body copy)
- **Display Headings**: `DM Sans` (dashboard titles, card headings)

---

## Implemented Pages & Routes

### Public Authentication
- **`/login`**: Centered login interface with show/hide password toggle, friendly error mapping (401 invalid credentials, 403 locked/unverified), and navigation to recovery.
- **`/register`**: Name, email, password, and password confirmation with client-side validation and guided next steps.
- **`/verify-email`**: Reads `?token=...` from query parameter or accepts manual token entry, verifies token via `GET /api/auth/verify-email`, and displays success/error states.
- **`/forgot-password`**: Request form with non-enumerating generic confirmation message and expiration notices.
- **`/reset-password`**: Token input, new password with confirmation, visibility toggles, and token revocation messaging.

### Authenticated Workspace (Persistent Shell)
- **`/dashboard`** (`/app`): Welcome banner, user identity profile, active sessions summary, live security parameters, and quick action shortcuts.
- **`/sessions`**: Active session table showing shortened UUID identifiers, expiration dates, relative times, and a confirmation modal before revoking sessions via `DELETE /api/sessions/{sessionId}`.
- **`/users`**: User directory with search bar, status badges (Active, Locked, Disabled), email verification flags, and role labels.
- **`/settings`**: Account details, cryptographic policy overview, and session/password reset shortcuts.

### Administrative Console (Role: `ROLE_ADMIN`)
- **`/admin`**: Operational telemetry (total users, email-verified count, locked accounts, and audit count) derived exclusively from active backend endpoints.
- **`/admin/audit`**: Real-time security and audit events table (`GET /api/admin/audit`), filterable by outcome (Success/Failure), event type, and email. Includes an untrusted plain-text viewer modal.
- **`/admin/audit/email/:email`**: Direct email-specific audit trail (`GET /api/admin/audit/email/{email}`).
- **`/admin/login-risk`**: Dedicated preview interface presenting the target heuristic scoring model (+30 failed logins, +20 unfamiliar IP, +20 rapid velocity) and backend dependency checklist without fabricated data.
- **`/forbidden`**: Friendly 403 Access Denied explanation and safe navigation back to the dashboard.

---

## Backend API Integration & Contracts

| Endpoint | Method | Role | Status / Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Registers account with `ROLE_USER` |
| `/api/auth/login` | `POST` | Public | Returns `accessToken`, `refreshToken`, `expiresIn`, `userId`, `email` |
| `/api/auth/verify-email?token=` | `GET` | Public | Consumes one-time verification token |
| `/api/auth/forgot-password` | `POST` | Public | Generates 15-minute reset token |
| `/api/auth/reset-password` | `POST` | Public | Updates password and revokes active sessions |
| `/api/auth/refresh` | `POST` | Public | Rotates access token via opaque refresh token |
| `/api/auth/logout` | `POST` | Public | Revokes refresh token in database |
| `/api/sessions` | `GET` | Authenticated | Lists active sessions for current user |
| `/api/sessions/{sessionId}` | `DELETE` | Authenticated | Revokes specific session UUID |
| `/api/users` | `GET` | Authenticated | Lists registered accounts |
| `/api/admin/dashboard` | `GET` | ADMIN | Confirms `ROLE_ADMIN` authority |
| `/api/admin/audit` | `GET` | ADMIN | Lists latest 100 audit events |
| `/api/admin/audit/email/{email}` | `GET` | ADMIN | Lists latest 50 events for specific email |

---

## Authentication Lifecycle & Token Management
1. **Bearer Token Injection**: Attaches `Authorization: Bearer <accessToken>` automatically to all authenticated requests.
2. **Single-Refresh Queue**: If a `401 Unauthorized` occurs while access token is expired, a single refresh request is sent to `/api/auth/refresh`. Concurrent requests are queued and retried with the new token once resolved, preventing refresh racing.
3. **No Refresh on 403**: Forbidden responses do not trigger refresh loops and redirect cleanly to `/forbidden`.
4. **Complete Client Logout**: Invalidator triggers backend `/api/auth/logout` and clears client storage immediately.

---

## Getting Started

### 1. Run the Spring Boot Backend
Ensure PostgreSQL is running, then from the backend folder:
```bash
cd iam-platform
./mvnw spring-boot:run
```
Backend runs on `http://localhost:8080`.

### 2. Run the React Frontend
From the frontend folder:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
