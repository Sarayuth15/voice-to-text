# Monitor Claude Token Usage

A **single-tenant** web dashboard for tracking Anthropic (Claude) API token
usage and spend over time. Configure an **Anthropic Admin API key** once, and
the backend periodically pulls usage/cost data from Anthropic's Usage & Cost
Admin API, stores it in MySQL, and the frontend renders it as charts.

No accounts, no login - this is meant to be self-hosted by one person or team
on their own instance (see [Security](#security) below).

## Features

- Configure one or more Anthropic Admin API keys from the UI (stored
  encrypted, never shown back in full)
- Scheduled + on-demand sync of usage and cost data from Anthropic's Admin API
- Dashboard with stat cards, tokens-over-time, spend-over-time, and
  per-model breakdown charts
- Date range presets (7d / 30d / 90d)

## Stack

| Layer       | Tech                                                                       |
|-------------|-----------------------------------------------------------------------------|
| Backend     | Java 21, Spring Boot 4.1.1 (web, data-jpa, validation), Maven, MySQL, Lombok |
| Frontend    | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Recharts     |
| Auth        | None - open API, meant for local/trusted-network use                        |
| Data source | Anthropic Admin API (`/v1/organizations/usage_report/messages`, `/v1/organizations/cost_report`) |

## Project structure

```
backend/     Spring Boot API (config, entity, repository, dto, service, controller, exception)
frontend/    Next.js app (app router pages, components, lib, types)
```

Each has its own build - there is no monorepo tool tying them together; run
them as two separate processes locally. See `backend/` and `frontend/` for
their internal layout, or `claude.md` for the full architecture writeup.

## Getting started

### Prerequisites

- Java 21
- Node.js (for Next.js 16 / React 19)
- MySQL
- An [Anthropic Admin API key](https://console.anthropic.com/settings/admin-keys)

### 1. Database

```sql
CREATE DATABASE monitor_claude_usage;
```

### 2. Backend

```bash
cd backend
```

Set environment variables (all have local-dev defaults in
`application.yaml`, but override every one of these in any real deployment):

| Variable                     | Purpose                                              | Default (dev only)         |
|-------------------------------|-------------------------------------------------------|-----------------------------|
| `DB_URL`                      | JDBC URL                                              | `jdbc:mysql://localhost:3306/monitor_claude_usage` |
| `DB_USERNAME`                 | MySQL username                                        | `root`                      |
| `DB_PASSWORD`                 | MySQL password                                        | -                           |
| `APP_ENCRYPTION_SECRET`       | 32-byte base64 key used to encrypt stored API keys (`openssl rand -base64 32`) | - |
| `USER_EMAIL`                  | Optional cosmetic label shown in the sidebar          | (blank)                     |
| `SERVER_PORT`                 | Backend port                                          | `8888`                      |
| `APP_CORS_ALLOWED_ORIGINS`    | Comma-separated origins allowed to call the API       | `http://localhost:3000,http://localhost:3001` |
| `APP_SYNC_CRON`                | Cron expression for the scheduled usage sync          | hourly                      |
| `APP_SYNC_LOOKBACK_DAYS`      | How many days back each sync re-pulls                  | `7`                          |

Then run it:

```bash
./mvnw spring-boot:run
```

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888
```

(adjust the port to match wherever the backend is actually running)

```bash
npm run dev
```

Open the app, then use the in-app **Setup Guide** page for the same
walkthrough plus instructions for getting an Anthropic Admin API key and
adding it via **Configuration**.

## REST API

No auth header required anywhere - see [Security](#security).

| Method | Path                                                    | Purpose                                                        |
|--------|----------------------------------------------------------|-----------------------------------------------------------------|
| GET    | `/api/config`                                             | `{ ownerEmail }` cosmetic label shown in the sidebar             |
| GET    | `/api/keys`                                                | List configured Anthropic API keys (masked)                     |
| POST   | `/api/keys`                                                | Add a new Anthropic Admin API key (`{label, apiKey}`)            |
| DELETE | `/api/keys/{id}`                                           | Remove a key (and its usage/cost data)                          |
| POST   | `/api/keys/{id}/sync`                                      | Trigger an immediate sync; check `lastSyncStatus`/`lastSyncError` in the response |
| GET    | `/api/usage/summary?start=&end=`                           | Totals (tokens, cost) across all configured keys in range        |
| GET    | `/api/usage/timeseries?start=&end=&groupBy=day\|model\|key` | Bucketed series for charts                                       |
| GET    | `/api/usage/by-model?start=&end=`                          | Token breakdown by model                                         |

Dates are ISO-8601 (`YYYY-MM-DD`), inclusive, interpreted as UTC.

## Security

- **No authentication.** Every endpoint under `/api/**` is open. This is a
  deliberate tradeoff for a single-tenant, self-hosted tool - **do not**
  expose the backend directly on the public internet without putting access
  control in front of it (reverse proxy with basic auth, VPN, etc).
- API keys are stored AES-256-GCM encrypted, keyed by `APP_ENCRYPTION_SECRET`.
  The API only ever returns a masked form (`maskedKey`); the full key is
  decrypted only in-process to call Anthropic.
- CORS is restricted to `APP_CORS_ALLOWED_ORIGINS` - the one remaining gate
  on who can call the API from a browser.
- Never commit real values for `DB_PASSWORD` or `APP_ENCRYPTION_SECRET`.

## Status

Working end to end: configure an Anthropic Admin API key via Configuration,
scheduled + manual sync into MySQL, and a dashboard reading it back through
the REST API above.

Known gaps:
- No automated tests yet (backend or frontend).
- No access control (see [Security](#security)) - fine for local/trusted use only.
- The Anthropic Admin API response shapes are written from documentation and
  not yet verified against a live call - see `AnthropicAdminClient` and its
  DTOs if something doesn't parse as expected.

## License

No license file yet - all rights reserved by default until one is added.
