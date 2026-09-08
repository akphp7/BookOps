# BookOps — Multi-Tenant Booking & Payments Platform

**BookOps** is a full-stack SaaS platform that lets service providers publish a public booking page, manage services and availability, accept OTP-verified bookings, and receive automated wallet-based payouts — with optional Stripe payments and Google Calendar sync.

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?style=flat-square&logo=stripe&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## What It Does

Each provider signs up, gets a unique public URL (`/book/your-slug`), and can:

- Define **services** with custom duration, price, and description
- Set **weekly availability** windows per day
- Accept **bookings** from clients via a zero-login public booking page
- Require **OTP email verification** for both registration and booking
- Collect **Stripe payments** with automated 90/10 platform fee splits
- Track **earnings** in a wallet ledger and request withdrawals
- Sync bookings to **Google Calendar** automatically

---

## System Architecture

```mermaid
flowchart TD
    subgraph Clients["Client Layer"]
        Provider["Service Provider"]
        Customer["Customer"]
        Admin["Platform Admin"]
    end

    subgraph Frontend["Frontend — React 19 + Vite + Tailwind CSS"]
        Dashboard["Provider Dashboard\n/services · /availability · /bookings · /payments · /profile"]
        PublicPage["Public Booking Wizard\n/book/:slug"]
        AdminPanel["Admin Panel\n/admin/dashboard"]
    end

    subgraph Backend["Backend — Node.js + Express 5 — Port 5000"]
        direction TB
        AuthAPI["/api/auth\nJWT · OTP · bcrypt"]
        PublicAPI["/api/public/:slug\nSlot engine · Booking creation"]
        BookAPI["/api/bookings\nLifecycle · Reschedule · Cancel"]
        ServAPI["/api/services\nCRUD"]
        AvailAPI["/api/availability\nWeekly schedule"]
        PayAPI["/api/payments\nWallet · Withdrawals"]
        IntAPI["/api/integrations\nGoogle OAuth2"]
        AdminAPI["/api/admin\nDashboard · Withdrawal approval"]
    end

    subgraph MongoDB["MongoDB — Data Layer"]
        direction LR
        UserC[("User")]
        ServiceC[("Service")]
        AvailC[("Availability")]
        BookingC[("Booking")]
        WalletC[("WalletTransaction")]
        WithdrawC[("Withdrawal")]
        OtpC[("EmailOtp")]
    end

    subgraph External["External Services"]
        Stripe["Stripe\nCheckout Sessions"]
        Brevo["Brevo\nTransactional Email"]
        GCal["Google Calendar\nOAuth2 + Events API"]
    end

    Provider --> Dashboard
    Customer --> PublicPage
    Admin --> AdminPanel

    Dashboard -->|"REST — Bearer JWT"| AuthAPI
    Dashboard -->|"REST — Bearer JWT"| ServAPI
    Dashboard -->|"REST — Bearer JWT"| AvailAPI
    Dashboard -->|"REST — Bearer JWT"| BookAPI
    Dashboard -->|"REST — Bearer JWT"| PayAPI
    Dashboard -->|"REST — Bearer JWT"| IntAPI
    PublicPage -->|"REST — No auth"| PublicAPI
    AdminPanel -->|"REST — Admin JWT"| AdminAPI

    AuthAPI --> UserC
    AuthAPI --> OtpC
    AuthAPI --> Brevo
    ServAPI --> ServiceC
    AvailAPI --> AvailC
    BookAPI --> BookingC
    BookAPI --> GCal
    BookAPI --> Brevo
    PayAPI --> WalletC
    PayAPI --> WithdrawC
    PublicAPI --> BookingC
    PublicAPI --> AvailC
    PublicAPI --> ServiceC
    PublicAPI --> OtpC
    PublicAPI --> Stripe
    PublicAPI --> GCal
    PublicAPI --> Brevo
    IntAPI --> GCal
    AdminAPI --> UserC
    AdminAPI --> BookingC
    AdminAPI --> WalletC
    AdminAPI --> WithdrawC
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router v7 |
| Backend | Node.js, Express 5, Mongoose 9 |
| Database | MongoDB |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Payments | Stripe Checkout |
| Email & OTP | Brevo (Sendinblue) Transactional API |
| Calendar | Google Calendar API (googleapis) |
| Deploy | Vercel (frontend), any Node host (backend) |

---

## Key Engineering Details

### 1. Public Booking Flow

The end-to-end flow from a customer visiting a provider's page to a confirmed booking:

```mermaid
sequenceDiagram
    actor Customer
    participant FE as Frontend
    participant BE as Backend
    participant DB as MongoDB
    participant Brevo as Brevo Email
    participant Stripe as Stripe
    participant GCal as Google Calendar

    Customer->>FE: Visit /book/:slug
    FE->>BE: GET /api/public/:slug
    BE->>DB: Find user by slug + active services
    DB-->>BE: Business info + services
    BE-->>FE: Business profile + service list

    Customer->>FE: Select service + date
    FE->>BE: GET /api/public/:slug/slots?date=&serviceId=
    BE->>DB: Load availability windows + existing bookings
    Note over BE: Walk windows in service.duration increments
    Note over BE: Skip slots overlapping confirmed or recent pending_payment bookings
    BE-->>FE: Available time slots

    Customer->>FE: Enter email, request OTP
    FE->>BE: POST /api/public/:slug/request-otp
    BE->>DB: Create EmailOtp record
    BE->>Brevo: Send OTP email
    Brevo-->>Customer: OTP code in inbox

    Customer->>FE: Submit OTP + booking details
    FE->>BE: POST /api/public/:slug/book
    BE->>DB: Check slot conflicts
    BE->>DB: Verify + consume OTP

    alt Free Service (price = 0)
        BE->>DB: Create Booking status=confirmed
        BE->>GCal: Create calendar event
        BE->>Brevo: Send confirmation email (async)
        BE-->>FE: Booking confirmed
        FE-->>Customer: Success screen
    else Paid Service
        BE->>DB: Create Booking status=pending_payment
        BE->>Stripe: Create Checkout Session
        BE-->>FE: Stripe checkout URL
        FE-->>Customer: Redirect to Stripe
        Customer->>Stripe: Complete payment
        Stripe-->>FE: Redirect to /booking/success?session_id=
        FE->>BE: GET /api/public/booking/status?session_id=
        BE->>Stripe: Retrieve session + verify payment_status=paid
        BE->>DB: Confirm Booking + create WalletTransaction
        BE->>GCal: Create calendar event
        BE->>Brevo: Send confirmation email (async)
        BE-->>FE: Booking confirmed
        FE-->>Customer: Success screen
    end
```

---

### 2. Booking Lifecycle State Machine

Every booking moves through a defined set of states. Provider actions and payment events drive transitions:

```mermaid
stateDiagram-v2
    direction LR
    [*] --> pending_payment : Paid service booked
    [*] --> confirmed : Free service booked

    pending_payment --> confirmed : Stripe payment verified
    pending_payment --> payment_failed : Payment failed or customer cancelled

    confirmed --> cancelled : Provider cancels
    confirmed --> confirmed : Provider reschedules

    payment_failed --> [*]
    cancelled --> [*]
    confirmed --> [*] : Appointment completed
```

---

### 3. Wallet & Payment Pipeline

Every paid booking flows through an automated earnings pipeline. Platform takes 10%, provider keeps 90%:

```mermaid
flowchart LR
    A(["Customer pays\nvia Stripe"]) --> B["Booking\nconfirmed"]
    B --> C["calculatePlatformSplit\namount × 0.10"]
    C --> D["Platform Fee\n10%"]
    C --> E["Provider Payout\n90%"]
    E --> F["WalletTransaction\ntype: booking_payout\nstatus: available"]
    F --> G{"Provider requests\nwithdrawal"}
    G --> H["WalletTransaction\ntype: withdrawal_hold\nstatus: pending"]
    G --> I["Withdrawal record\ncreated"]
    I --> J{"Admin reviews"}
    J -->|"Approved"| K(["Withdrawal: paid\nFunds transferred"])
    J -->|"Rejected"| L["WalletTransaction\ntype: withdrawal_reversal\nFunds returned to wallet"]

    style D fill:#f87171,color:#fff
    style E fill:#34d399,color:#fff
    style K fill:#34d399,color:#fff
    style L fill:#f87171,color:#fff
```

---

### 4. Slot Generation Algorithm

How available time slots are computed for a given provider, service, and date:

```mermaid
flowchart TD
    A(["GET /slots?date=&serviceId="]) --> B["Load provider availability\nfor dayOfWeek"]
    B --> C{"Availability\nexists?"}
    C -->|"No"| D(["Return empty slots"])
    C -->|"Yes"| E["Load existing bookings\nfor that date"]
    E --> F["Filter: status=confirmed OR\nstatus=pending_payment AND age < 30min"]
    F --> G["For each availability window:\ncursor = window.startTime"]
    G --> H{"cursor + duration\n<= window.endTime?"}
    H -->|"No"| I{"More windows?"}
    I -->|"Yes"| G
    I -->|"No"| J(["Return available slots"])
    H -->|"Yes"| K["Candidate slot:\nstartTime=cursor\nendTime=cursor+duration"]
    K --> L{"Overlaps any\nexisting booking?"]
    L -->|"Yes — skip"| M["cursor += duration"]
    L -->|"No — available"| N["Add to slots list"]
    N --> M
    M --> H
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

### 1. Clone the repo

```bash
git clone https://github.com/akphp7/BookOps.git
cd BookOps
```

### 2. Setup the backend

```bash
cd backend
npm install
cp .env.example .env   # Fill in your values
npm start
```

Backend runs at `http://localhost:5000`

### 3. Setup the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Environment Variables

Create `backend/.env` using the table below:

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ | Secret key for signing JWTs |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `ADMIN_EMAIL` | ✅ | Admin portal login email |
| `ADMIN_PASSWORD` | ✅ | Admin portal login password |
| `STRIPE_SECRET_KEY` | Optional | Enables paid bookings via Stripe |
| `BREVO_API_KEY` | Optional | Enables OTP and booking emails |
| `BREVO_SENDER_EMAIL` | Optional | From address for emails |
| `BREVO_SENDER_NAME` | Optional | From name for emails |
| `GOOGLE_CLIENT_ID` | Optional | Enables Google Calendar sync |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth secret |
| `GOOGLE_REDIRECT_URI` | Optional | Google OAuth callback URL |
| `CLIENT_URL` | Optional | Frontend URL for Stripe redirects (default: `http://localhost:5173`) |

> Stripe, Brevo, and Google Calendar are all optional. The core booking flow works without them (free services only).

---

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register/request-otp` | — | Send registration OTP |
| POST | `/api/auth/register` | — | Create provider account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET/POST/PATCH/DELETE | `/api/services` | JWT | Service CRUD |
| GET/PUT | `/api/availability` | JWT | Weekly schedule |
| GET/PATCH | `/api/bookings` | JWT | List and manage bookings |
| GET/POST/PUT | `/api/payments` | JWT | Wallet, withdrawals, payout details |
| GET | `/api/public/:slug` | — | Public business + services |
| GET | `/api/public/:slug/slots` | — | Available slots for date + service |
| POST | `/api/public/:slug/book` | — | Create a booking |
| GET | `/api/admin/dashboard` | Admin | Platform stats + withdrawals |

---

## Project Structure

```
BookOps/
├── backend/
│   ├── controllers/        # Request handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── middleware/         # JWT auth, admin auth
│   ├── utils/              # Slot generator, wallet, Stripe, email, etc.
│   ├── config/             # DB connection
│   └── server.js           # Entry point
│
├── frontend/
│   └── src/
│       ├── pages/          # 12 route-level page components
│       ├── admin/          # Admin dashboard + login
│       ├── components/     # Shared layout components
│       ├── api/            # Axios API service files
│       └── context/        # Toast notifications context
│
└── docs/                   # Setup guides for Stripe, Brevo, Google Calendar
```

---

## Optional Integrations Setup

| Integration | Guide |
|---|---|
| Google Calendar | [docs/google-calendar-setup](docs/google-calendar-setup/README.md) |
| Stripe Payments | [docs/stripe-setup](docs/stripe-setup/README.md) |
| Brevo Email | [docs/brevo-setup](docs/brevo-setup/README.md) |

---

## License

MIT
