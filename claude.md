# Monitor Claude Token Usage

A **single-tenant** web dashboard that tracks Anthropic (Claude) API token
usage and spend over time. No accounts, no login: you configure an
**Anthropic Admin API key** once (via the Configuration page), and the
backend periodically pulls usage/cost data from Anthropic's Usage & Cost
Admin API, stores it in MySQL, and the Next.js frontend renders it as charts.

## Stack

| Layer    | Tech                                                                 |
|----------|-----------------------------------------------------------------------|
| Backend  | Java 21, Spring Boot 4.1.1 (web, data-jpa, validation), Maven, MySQL, Lombok |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Recharts |
| Auth     | None - open API, meant for local/trusted-network use (see Security notes) |
| Data source | Anthropic Admin API — `/v1/organizations/usage_report/messages` and `/v1/organizations/cost_report` |

Directories: `backend/` (Spring Boot API), `frontend/` (Next.js app). Each has
its own build — there is no monorepo tool tying them together; run them as two
separate processes locally.

> Note: `frontend/` has its own nested `.git` (from `create-next-app`). The
> project root is **not** currently a git repo. If you want one repo covering
> both `backend/` and `frontend/`, remove `frontend/.git` before running
> `git init` at the root, or decide on a submodule setup — this hasn't been
> done yet since it's a one-way decision worth making deliberately.

## Why single-tenant, no login

Originally built multi-user with JWT auth, then deliberately simplified: this
is meant to be run by one person or one team as their own instance (self-hosted,
one deployment per org), not as a shared product with separate accounts per
visitor. Removing login means anyone who can reach the backend can read usage
data and manage the Anthropic API key - acceptable for a tool that lives on
localhost or behind your own network/VPN, **not** acceptable to expose
directly on the public internet without adding access control back (a reverse
proxy with basic auth, a VPN, etc.) - see Security notes.

## Data model (MySQL)

- **anthropic_api_keys** — id, label, encrypted key material (AES-GCM, see
  below), key_prefix (last 4 chars shown in UI), created_at, last_synced_at,
  last_sync_status, last_sync_error. Global to the instance - not scoped to
  any user.
- **usage_records** — one row per (api_key_id, bucket_start, model,
  workspace_id, service_tier) - bucket width is always a day (`bucket_width=1d`
  is fixed, not a stored column): uncached_input_tokens,
  cache_creation_1h/5m_input_tokens, cache_read_input_tokens, output_tokens,
  web_search_requests. Upserted on sync so re-syncing a time range is idempotent.
- **cost_records** — one row per (api_key_id, bucket_start, workspace_id,
  description) holding amount + currency from the cost report. Same
  upsert-on-sync idempotency.

Both fact tables carry a unique constraint over their full grouping key so a
scheduled re-sync overwrites rather than duplicates. Anthropic can return a
null workspace_id/service_tier/description; those are normalized to an empty
string (`UsageRecord.NONE` / `CostRecord.NONE`) before persisting, since MySQL
treats each NULL in a unique key as distinct from every other NULL - a bare
nullable column wouldn't actually enforce one-row-per-bucket.

## Anthropic Admin API integration

Calls made server-side only (the Admin key never reaches the browser):

- `GET https://api.anthropic.com/v1/organizations/usage_report/messages`
  - Headers: `x-api-key: <admin key>`, `anthropic-version: 2023-06-01`.
  - Query: `starting_at`, `ending_at`, `bucket_width` (`1d` for this app),
    `group_by[]=api_key_id&group_by[]=model&group_by[]=workspace_id`, `limit`,
    `page` (cursor from `next_page`).
  - Response: `{ data: [{ starting_at, ending_at, results: [...] }],
    has_more, next_page }`. Paginate until `has_more` is false.
- `GET https://api.anthropic.com/v1/organizations/cost_report`
  - Same auth/pagination shape; `group_by[]=workspace_id&group_by[]=description`.
  - `results[]` carries `amount` (string decimal) + `currency`.

These field/param names are per Anthropic's published Usage & Cost Admin API
docs at the time this was written — **verify against
https://docs.anthropic.com/en/api/usage-cost-api before relying on it in
production**, since Admin API surface area has changed before and the parsing
code (`AnthropicAdminClient` + its response DTOs) is the single place that
would need updating if it has.

Sync cadence: `UsageSyncService` runs on a fixed schedule (default hourly, see
`app.sync.cron`) for every stored API key, pulling the last N days (default 7,
`app.sync.lookback-days`) so late-arriving data gets picked up. You can also
trigger `POST /api/keys/{id}/sync` on demand from the Configuration page.

## Security notes

- **No authentication.** Every endpoint under `/api/**` is open. This is a
  deliberate tradeoff for a single-tenant, self-hosted tool (see "Why
  single-tenant, no login" above) - don't expose the backend to the public
  internet without putting access control in front of it.
- API keys are stored AES-256-GCM encrypted (`CryptoService`), keyed by
  `app.encryption.secret` (32-byte base64, env-provided — **never commit a
  real value**). The API only ever returns a masked form (`maskedKey`, built
  from the stored `key_prefix` - last 4 chars); the full key is decrypted only
  in-process to call Anthropic.
- CORS is restricted to `app.cors.allowed-origins` (default
  `http://localhost:3000` for local dev) - the one remaining gate on who can
  call the API from a browser.

## Backend layout (`backend/src/main/java/com/example/backend`)

```
config/      CorsConfig (the only "security" config left - see above)
entity/      AnthropicApiKey, SyncStatus, UsageRecord, CostRecord
repository/  Spring Data JPA repositories for the above
dto/apikey/  ApiKeyCreateRequest, ApiKeyResponse
dto/usage/   UsageSummaryResponse, TimeseriesPointResponse, ModelBreakdownResponse
dto/config/  AppConfigResponse
service/     ApiKeyService, CryptoService, UsageSyncService, UsageQueryService
service/anthropic/  AnthropicAdminClient + raw response DTOs (UsageReportResponse, CostReportResponse)
controller/  ApiKeyController, UsageController, ConfigController
exception/   ApiException, GlobalExceptionHandler
```

Scheduling is enabled via `@EnableScheduling` on `BackendApplication`, not a
separate config class.

## REST API contract

No auth header required anywhere - see Security notes.

| Method | Path                       | Purpose                                      |
|--------|----------------------------|-----------------------------------------------|
| GET    | `/api/config`              | `{ ownerEmail }` - cosmetic label read from the `USER_EMAIL` env var, shown in the sidebar |
| GET    | `/api/keys`                | List configured Anthropic API keys (masked)   |
| POST   | `/api/keys`                | Add a new Anthropic Admin API key (`{label, apiKey}`) |
| DELETE | `/api/keys/{id}`           | Remove a key (and its usage/cost data)        |
| POST   | `/api/keys/{id}/sync`      | Trigger an immediate sync; always 200, check `lastSyncStatus`/`lastSyncError` in the response for failure |
| GET    | `/api/usage/summary?start=&end=` | Totals (tokens, cost) across all configured keys in range |
| GET    | `/api/usage/timeseries?start=&end=&groupBy=day\|model\|key` | Bucketed series for charts (`groupBy` case-insensitive, default `day`) |
| GET    | `/api/usage/by-model?start=&end=` | Token breakdown by model (cost is always 0 here - Anthropic's cost report isn't broken down by model) |

Dates are ISO-8601 (`YYYY-MM-DD`), inclusive, interpreted as UTC. An
`ApiKeyResponse` never carries the real key - only `maskedKey` (e.g. `••••ab12`).

## Frontend layout (`frontend/`)

```
lib/api.ts             fetch wrapper: base URL from NEXT_PUBLIC_API_BASE_URL, throws ApiError
lib/date-range.ts       date range presets (7d/30d/90d) + ISO date helpers
lib/format.ts           compact-number / currency formatting
app/page.tsx            "/" - redirects straight to /dashboard, no login gate
app/dashboard/page.tsx        overview: stat cards + tokens-over-time + spend-over-time + by-model charts
app/setup-guide/page.tsx      static walkthrough: get an Admin key, configure env vars, run both apps, add the key
app/configuration/page.tsx    manage Anthropic API keys, manual "sync now"
components/  Sidebar, StatCard, DateRangeControl, ChartTooltip, EmptyChartState,
             UsageChart, CostChart, ModelBreakdownChart, ApiKeyForm, ApiKeyList, CopyButton
types/api.ts            TS types mirroring the backend DTOs above
```

The sidebar (`components/Sidebar.tsx`) is the only navigation: Dashboard,
Setup Guide, Configuration. It also fetches `/api/config` once to show the
optional owner-email label at the bottom.

Charts follow the `dataviz` skill: a validated categorical/sequential palette
lives as CSS custom properties in `app/globals.css` (`--chart-*`, with a
`prefers-color-scheme: dark` override) - swap those values to retarget a
different brand; the chart components themselves reference the tokens by
name and don't need to change.

## Local dev setup

**Backend**
1. Create a MySQL database: `CREATE DATABASE monitor_claude_usage;`
2. Set env vars (see `backend/src/main/resources/application.yaml` for full
   list, and `app/setup-guide` in the running app for the walkthrough):
   `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `APP_ENCRYPTION_SECRET` (32-byte
   base64 — generate with `openssl rand -base64 32`), optionally `USER_EMAIL`
   (cosmetic sidebar label).
3. `cd backend && ./mvnw spring-boot:run`

**Frontend**
1. `cd frontend && npm install`
2. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` in `.env.local`
   (adjust the port to match wherever the backend is actually running).
3. `npm run dev`

Then open the app and use the in-app **Setup Guide** page - it's the same
walkthrough as above, plus getting an Anthropic Admin API key and adding it
via **Configuration**.

## Status

Working end to end, single-tenant: configure an Anthropic Admin API key via
Configuration, scheduled + manual sync into MySQL, and a dashboard reading it
back through the REST API above. No login anywhere in the app.

Verified so far:
- Backend: `./mvnw compile`, `test-compile`, and `package` all succeed (Java 21,
  Spring Boot 4.1.1). Not yet run against a live MySQL instance or a real
  Anthropic Admin API key in this environment - do that before trusting the
  Anthropic response parsing (`AnthropicAdminClient` + its DTOs) completely.
- Frontend: `npx tsc --noEmit`, `npx eslint .`, and `npm run build` all pass
  (Next.js 16, React 19, Turbopack). Not yet exercised against a running
  backend in a browser.

Not done yet / known gaps:
- No automated tests (no unit tests for services, no `@SpringBootTest`
  wired to a test database, no frontend component tests).
- No access control at all (see Security notes) - fine for local/trusted use,
  not for exposing this on the open internet as-is.
- `frontend/`'s nested git repo vs. the un-versioned project root (see note
  above) hasn't been resolved.
- The Anthropic Admin API shapes in `AnthropicAdminClient` / `UsageReportResponse`
  / `CostReportResponse` are written from documentation, not verified against
  a live call - see the warning in "Anthropic Admin API integration" above.

Treat any other mismatch between this doc and the code as the code needing a
fix or this doc needing an update, whichever is actually true at the time.

## Conventions

- Backend: constructor injection (Lombok `@RequiredArgsConstructor`), DTOs as
  Java records, business logic in `service/`, controllers stay thin.
- Frontend: server components by default; add `"use client"` only where
  interactivity/hooks are needed. Keep API types in `types/api.ts` in sync
  with backend DTOs by hand (no codegen yet).
- Commit messages: conventional, imperative mood (`add usage sync service`).
