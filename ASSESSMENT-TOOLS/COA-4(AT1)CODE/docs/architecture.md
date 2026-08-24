# Architecture

## Overview

The platform follows the layered structure set out in the CO3 Assessment
Tool 3 repository review: a React client, an Express API, and a clean
separation between HTTP handling and business rules.

```
┌─────────────┐      HTTP (JSON)      ┌──────────────┐
│   client/    │  ───────────────────▶ │   server/    │
│  React + Vite│ ◀───────────────────  │ Express API  │
└─────────────┘                       └──────┬───────┘
                                              │
                              ┌───────────────┼────────────────┐
                              ▼               ▼                ▼
                        routes/*.js   logic/rules.js     data/store.js
                     (HTTP + RBAC)   (pure business rules) (in-memory data)
```

## Layers

- **`server/src/routes/`** — one router per capability (turbines, alerts,
  optimization, weather, maintenance, analytics). Routes handle HTTP
  concerns only: parsing the request, calling into `logic/` or `data/`,
  and shaping the response.
- **`server/src/logic/rules.js`** — pure, dependency-free functions that
  implement the decision table, boundary values, and state machine from
  Sections 4.1–4.4 of the Test Case Design Document. Because these have no
  Express or database dependency, they are unit-tested directly (see
  `tests/server/`) without needing to boot an HTTP server.
- **`server/src/middleware/auth.js`** — role-based access control (FR-08,
  NFR-04). The caller supplies a role via the `x-user-role` header; there is
  no login system in this demo.
- **`server/src/data/store.js`** — an in-memory data store standing in for
  a real database. Every route talks to this module through named
  functions, not directly to arrays, so it can be swapped for a
  PostgreSQL-backed repository later without changing route or logic code.

## Requirement → module map

| Requirement | Module |
|---|---|
| FR-01 Turbine monitoring | `routes/turbines.js` |
| FR-02 / FR-07 Predictive alerts | `routes/turbines.js` (evaluation) + `routes/alerts.js` (listing) + `logic/rules.js` (decision table) |
| FR-03 Energy optimisation | `routes/optimization.js` + `logic/rules.js` (BVA) |
| FR-04 Weather tracking | `routes/weather.js` |
| FR-05 Maintenance scheduling | `routes/maintenance.js` + `logic/rules.js` (state machine, conflict, date validation) |
| FR-06 Operational analytics | `routes/analytics.js` |
| FR-08 / NFR-04 Access control | `middleware/auth.js` |

## Known simplifications (see README "Future Enhancements")

- Data is in-memory and resets on server restart — there is no database yet.
- Authentication is a request header, not a real login/session system.
- The client polls every 5 seconds rather than using a push channel
  (WebSocket/SSE), which is the more scalable approach at higher turbine
  counts (NFR-05).
