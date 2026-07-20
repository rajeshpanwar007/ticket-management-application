# Client

React SPA for the Support Ticket Management System.

## Setup

```bash
cd client
cp .env.example .env
npm install
```

## Run

```bash
npm run dev
```

App runs at `http://localhost:5173`. API requests proxy to `http://localhost:5000/api`.

## Structure

```
client/src/
├── api/                  # Axios client + endpoint wrappers
├── components/
│   ├── comments/         # Comment thread components
│   ├── common/           # Shared UI components
│   ├── layout/           # Navbar, Breadcrumbs
│   └── tickets/          # Ticket-specific components
├── constants/            # Status enums and labels
├── context/              # AuthContext, ToastContext
├── hooks/                # useTickets, useTicket, useUsers, useDebounce
├── layouts/              # App shell layout
├── pages/                # Route-level pages
├── routes/               # AppRoutes
└── utils/                # Validation helpers
```

## Routes

| Path | Page |
|------|------|
| `/` | Dashboard |
| `/tickets` | Ticket List |
| `/tickets/new` | Create Ticket |
| `/tickets/:id` | Ticket Detail |
| `/tickets/:id/edit` | Edit Ticket |
| `/login` | Login (stretch) |

See [`../ui-flow.md`](../ui-flow.md) for full UI design.
