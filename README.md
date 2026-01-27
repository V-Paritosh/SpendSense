# SpendSense

## Overview

SpendSense is a personal finance web app that helps users track income, expenses, debts, and payments in one place. It targets developers, recruiters, and users who want a lightweight, auditable view of how money moves through their accounts without installing a native app.

## Features

- Supabase Auth sessions for signup, login, and logout
- Capture income, expenses, debts, and payments with client-side validation
- Instant refresh of balances and activity lists after inserts
- Responsive Bootstrap UI across landing, dashboard, and transactions
- Schema designed for per-user isolation and RLS compatibility

## Tech Stack

- Frontend: HTML, CSS, Bootstrap 5, vanilla JavaScript
- Backend: Supabase JS client calling PostgREST endpoints
- Database: PostgreSQL managed by Supabase
- Auth: Supabase Auth with browser sessions
- Other tools: Bootstrap Icons, form validation utilities

## Database Design (Visual Overview)

```
users
┌───────────────────────────────┐
│ PK id (uuid)                  │
│ firstName                     │
│ lastName                      │
│ email (unique)                │
│ created_at                    │
└───────────────────────────────┘
		   ↑ FK id
		   │
		   │
income                     expenses                  debts                     payments
┌────────────────────┐     ┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│ PK (userId, id)    │     │ PK (userId, id)    │    │ PK (userId, id)    │    │ PK (userId, id)    │
│ userId (FK users)  │     │ userId (FK auth)   │    │ userId (FK users)  │    │ userId (FK auth)   │
│ source             │     │ category           │    │ type               │    │ type               │
│ amount             │     │ amount             │    │ amount             │    │ amount             │
│ created_at         │     │ created_at         │    │ created_at         │    │ date               │
└────────────────────┘     └────────────────────┘    └────────────────────┘    └────────────────────┘
```

Relationships

- Each fact table owns a composite PK `(userId, id)` to enforce per-user namespacing.
- `userId` in facts references `auth.users` (and `public.users` where present) to pair data with authenticated identities.
- Defaults `now()` on timestamps provide ordering without triggers.

Data flow

- Auth issues a session token for the browser; inserts include the authenticated `userId` implicitly through RLS.
- Income, expenses, debts, and payments write to separate tables, enabling clear aggregation by type.
- Reads aggregate by `userId` to compute balances, spending, and net position for dashboards.

## System Architecture / How It Works

- Static frontend served from `/index.html` and feature pages in `/SpendSense/*`.
- Browser loads `supabase-js` from CDN, creates a client with project URL and anon key.
- Supabase Auth maintains the session; guarded actions call `auth.getSession` before inserts.
- Form submissions call Supabase PostgREST to insert rows; subsequent fetches refresh totals and lists.
- Row-level security (configured in Supabase) keeps tenants isolated via `userId`.

## Installation & Setup

1. Prerequisites: Supabase project with Postgres and Auth enabled; static HTTP server for local preview.
2. Clone: `git clone <repo-url>` then `cd SpendSense`.
3. Configure Supabase: create the tables (see schema above) and enable RLS policies per table.
4. Set client keys: update `SUPABASE_URL` and `SUPABASE_KEY` in [SpendSense/Transactions/script.js](SpendSense/Transactions/script.js) and any other Supabase clients.
5. Run locally: serve the root directory (`python -m http.server 8000` or Live Server) and open `http://localhost:8000`.

## Usage

- Sign up or log in to obtain a session.
- Add income, expenses, debts, or payments; validation guards empty fields and invalid numbers.
- Reload or navigate to dashboards to see updated aggregates.
- Sign out to clear the session.

## Future Improvements

- Add charts for trends, net worth, and budget burn-downs.
- Introduce categories, tags, and budget thresholds with alerts.
- Add pagination and search for large transaction sets.
- Provide offline caching with background sync.
- Offer CSV import or banking integrations to reduce manual entry.
