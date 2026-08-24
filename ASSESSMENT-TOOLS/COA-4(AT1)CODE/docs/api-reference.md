# API Reference

Base URL (local dev): `http://localhost:4000/api`

Endpoints marked **Role** require an `x-user-role` header
(`operator` or `administrator`; unauthenticated/unrecognised requests are
treated as `viewer`).

## Turbines

| Method | Path | Description |
|---|---|---|
| GET | `/turbines` | List all turbines with current telemetry. |
| GET | `/turbines/:id` | Get a single turbine. |
| POST | `/turbines/:id/telemetry` | Ingest a sensor reading `{ rpm, power, vibration, temperature }`; runs the Table 4.3 decision table and raises an alert if thresholds are crossed. |

## Alerts

| Method | Path | Description |
|---|---|---|
| GET | `/alerts` | List all raised alerts, most recent first. |

## Optimization

| Method | Path | Description |
|---|---|---|
| GET | `/optimization?windSpeed=<m/s>` | Classify a wind-speed reading against the cut-in/cut-out boundaries and return a recommendation. |

## Weather

| Method | Path | Description |
|---|---|---|
| GET | `/weather/:site` | Current conditions for a site. |
| GET | `/weather/:site/history?start=&end=` | Historical trend for a date range. |
| POST | `/weather/:site/advisory` **Role: operator/administrator** | Raise a storm advisory. |

## Maintenance

| Method | Path | Description |
|---|---|---|
| GET | `/maintenance` | List all maintenance tasks. |
| POST | `/maintenance` **Role: operator/administrator** | Create a task `{ turbineId, type, date }`. Rejects past dates (422) and same-day conflicts (409). |
| PATCH | `/maintenance/:id` **Role: operator/administrator** | Transition status `{ status }`, enforced by the Table 4.4 state machine (422 on an illegal transition). |
| POST | `/maintenance/:id/approve` **Role: administrator** | Approve a task. |

## Analytics

| Method | Path | Description |
|---|---|---|
| GET | `/analytics?start=&end=` | Per-turbine downtime/output/maintenance-count report. Rejects `end` earlier than `start` (422). |

## Error shape

```json
{ "error": "Validation Error", "message": "Date cannot be in the past." }
```
