# Smart Offshore Wind Farm Management Platform

Problem Statement 11 — CSA1007 Software Engineering, SIMATS Engineering.

A reference implementation of the platform described in the CO4-AT1 Test
Case Design Document: real-time turbine monitoring, predictive failure
alerts, energy-generation optimisation, weather tracking, maintenance
scheduling, and operational analytics.

This repository is the **coding deliverable**, kept separate from the Word
document as instructed — no test-case design content lives here, and no
source code lives in the document.

## Repository structure

```
smart-offshore-windfarm-platform/
├── server/            Express API
│   └── src/
│       ├── routes/     one router per capability (turbines, alerts, optimization, weather, maintenance, analytics)
│       ├── logic/      pure business rules (decision table, BVA, state machine)
│       ├── middleware/ auth (RBAC) and error handling
│       └── data/       in-memory data store
├── client/            React (Vite) operator dashboard
├── tests/server/      Jest unit tests — see "Traceability" below
├── docs/               architecture.md, api-reference.md
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 20+
- npm
- Docker (optional, for the containerised setup)

## Setup and run — local

```bash
# API server
cd server
npm install
npm start          # listens on http://localhost:4000

# In a second terminal — dashboard
cd client
npm install
npm run dev         # opens http://localhost:5173 (proxies /api to :4000)
```

## Setup and run — Docker

```bash
docker compose up --build
```

Server on `http://localhost:4000`, dashboard on `http://localhost:5173`.

## Running the tests

```bash
cd server
npm install
npm test
```

37 tests across 5 suites, covering the business rules and role-based access
control described below.

## Traceability to the Test Case Design Document

The automated tests are written directly against the same test case IDs,
techniques, and tables from the COA-4-AT1 Test Case Design Document, so the
two deliverables can be read side by side:

| Design document | Code |
|---|---|
| Table 4.3 Decision Table (R1–R6) | `server/src/logic/rules.js` → `evaluateTurbineStatus` |
| Table 4.2 Boundary Values (cut-in/cut-out) | `server/src/logic/rules.js` → `classifyWindSpeed` |
| Table 4.4 State Transitions | `server/src/logic/rules.js` → `canTransition` |
| TC-05 / TC-06 (vibration boundary) | `tests/server/alerts.test.js` |
| TC-09 – TC-12 (wind-speed boundaries) | `tests/server/optimization.test.js` |
| TC-17 / TC-18 / TC-19 (scheduling) | `tests/server/maintenance.test.js` |
| TC-20 – TC-22 (analytics date range) | `tests/server/analytics.test.js` |
| TC-24 / TC-25 (role-based access) | `tests/server/access-control.test.js` |

The **Actual Result / Status** columns in the Word document were marked
*"Not Run / Pending"* because no implementation existed yet at design time.
Running `npm test` in this repository is what turns those into real
pass/fail results.

## API

See [`docs/api-reference.md`](docs/api-reference.md) for the full endpoint
list, and [`docs/architecture.md`](docs/architecture.md) for the module
layout.

## Known simplifications / future enhancements

- In-memory data store, not a real database (a PostgreSQL-backed
  repository is the natural next step — see `docs/architecture.md`).
- Role is supplied via an `x-user-role` header rather than real
  authentication.
- Dashboard polls every 5 seconds rather than using a push channel
  (WebSocket/SSE), which would scale better at higher turbine counts.
- Real-time SMS/email alerting and historical trend forecasting, as noted
  in the CO3-AT3 repository review, are not yet implemented.

## License

Coursework submission for CSA1007 — Software Engineering, SIMATS
Engineering (Saveetha School of Engineering).
