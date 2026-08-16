# Approach

Spaceship X26 — Passenger Resource Management System. Backend-only REST API (Node.js + TypeScript, MySQL, no UI).

## 1. Scope:

Objectives:
1. Build a backend REST API (Node.js + TypeScript, MySQL) for the spaceship's passenger and
   resource management system — a layered `routes → services → repositories` architecture, no UI.
2. Get the important rules right: tier access is a simple rank check, only three Crew Leads can
   ever exist even under concurrent requests, and every resource use — granted or denied — gets
   logged — each backed by unit tests and manual verification.
3. Keep the codebase lean and maintainable: minimal dependencies, minimal speculative abstraction
   ahead of a real second use, and every service/middleware unit tested so the system stays
   easy to change with confidence.

Out of Scope:
- Rate limiting / API Pagination - Dropped in the interest of time. Originally planned for `express-rate-limit` to be implemented.
- Logging Library — plain `console` + `JSON.stringify` instead, in the interest of time
- User Interface — backend API only, in the interest of time
- `.http` file (`requests.http`) / some form of swagger open API spec — was originally planned but then replaced by the Postman collection instead, in the interest of time — both serve the same job, so building both would've been redundant. One is faster to set up than the other.
- CRUD for Crew Lead - Descoped in the interest of time. Some flexibility in requirements resulted in a boot start seed solution instead.
- JWT session based auth - Went with a simple API key schema instead of a identity system, the customer can pay us more as a feature request.
- Date ranges in Reporting: Reports show all time total - no dates range just everything from the beginning of time. This was a judgement call. The customer can send us a feature request and put it in our backlog.
- Reports only show rows with activities ().
- Fixed caps, not configurable: resource demand only shows the top 10, personal usage history only shows the last 100. No way to ask for more right now — another feature request for the backlog.
- No live/real-time analytics — the reports must be requested on demand - calling the endpoint to get the current numbers. The customer can request for another feature, we can sell them a live dashboard with a poll and subscription system for updates.

Gaps:
- Integration tests are incomplete. `tests/integration/usage.test.ts` covers the grant path, deny path, and ownership enforcement, but the crew-lead concurrency test and the two report aggregation tests have not yet been implemented.
  - I appreciate that integration tests are extremely important as they are the only way to prove real database behavior instead of a mock — but each needs real setup against a live MySQL, and they're expensive to write properly. I ran out of time before getting to them.

## 2. User Stories

System Requirements:
- The system has three Crew Leads
  - Taken the liberty to create this (enforced under concurency) in the system via boot time seed. No API endpoints for simplicity.

Crew Leads requirements:
- A Crew Lead can create and manage passenger profiles
  - Endpoints:  `POST /passengers`, `GET /passengers` and `DELETE /passengers/:id`
- A Crew Lead can upgrade or downgrade a passenger's membershit level
  - Endpoint: `PATCH /passengers/:id/membership`
- A Crew Lead can provision ship resources
  - Endpoint: `POST /resources`

Passenger requirements:
- A Passenger can discover resources available to their tier
  - Endpoint: `GET /passengers/:id/resources`
- A Passenger can use a resource with real time validation and audit logging
  - Endpoint: `POST /passengers/:id/usage`

Usage Analytics & Reporting requirements:
- A Crew Lead can see usage aggregated by passenger tier
  - Endpoint: `GET /reports/usage-by-level`
- A Crew Lead can see which resources are in the highest demand
  - Endpoint: `GET /reports/resource-demand`
- A passenger can view thier own usage history
  - Endpoint: `GET /passengers/:id/usage`

<!-- NOTES KEITH: Just found out that crew needs to decomission a resource -->

## 3. REST API

**Passengers**

| Method | Path | Auth | Request body | Success | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/passengers` | Crew Lead | `{ name, membershipLevel }` | `201` (passenger + one-time plaintext `apiKey`) | |
| GET | `/passengers` | any principal | — | `200` (array) | |
| DELETE | `/passengers/:id` | Crew Lead | — | `204` | soft deactivate |
| PATCH | `/passengers/:id/membership` | Crew Lead | `{ membershipLevel }` | `200` (updated passenger) | writes `membership_change` |
| GET | `/passengers/:id/resources` | Passenger (self only) | — | `200` (array, tier-filtered) | |
| POST | `/passengers/:id/usage` | Passenger (self only) | `{ resourceId }` | `201` granted / `403` denied | writes `usage_log` either way |
| GET | `/passengers/:id/usage` | Passenger (self only) | — | `200` (array, capped 100, newest first) | |

**Resources**

| Method | Path | Auth | Request body | Success | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/resources` | Crew Lead | `{ name, category, minimumLevel, capacity }` | `201` | |

**Reports**

| Method | Path | Auth | Request body | Success | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/reports/usage-by-level` | Crew Lead | — | `200` (array) | |
| GET | `/reports/resource-demand` | Crew Lead | — | `200` (array, ranked, capped top 10) | |

Auth: `Authorization: Bearer <api-key>`. The key resolves to a `Principal` (`role`, `id`, and
`membershipLevel` for passengers) via `auth.service.ts`, which checks the Crew Lead repository
before the Passenger repository. Responses never include `apiKeyHash` — the `Passenger`/
`CrewLead` *read* types don't carry that field at all, so there's nothing to accidentally leak;
only the *write* input types (`NewPassenger`, `NewCrewLead`) do. All numeric fields
(`MembershipLevel`) serialize as their raw enum number (`SILVER=1, GOLD=2, PLATINUM=3`) in every
response, even though request bodies accept the string name (`"GOLD"`).

## 4. Data model

```
  CREW_LEAD {
      int      id PK
      string   name
      string   apiKeyHash UK
      int      slot UK "1..3"
      datetime createdAt
  }

  PASSENGER {
      int      id PK
      string   name
      enum     membershipLevel "SILVER | GOLD | PLATINUM"
      enum     status "ACTIVE | INACTIVE"
      string   apiKeyHash UK
      int      createdByCrewLeadId FK
      datetime createdAt
  }

  RESOURCE {
      int      id PK
      string   name UK
      enum     category
      enum     minimumLevel "SILVER | GOLD | PLATINUM"
      int      capacity
      enum     status "ACTIVE | DECOMMISSIONED"
      int      provisionedByCrewLeadId FK
      datetime createdAt
  }

  USAGE_LOG {
      bigint   id PK
      int      passengerId FK
      int      resourceId FK
      enum     passengerLevelAtUse "snapshot"
      enum     resourceMinLevelAtUse "snapshot"
      enum     outcome "GRANTED | DENIED"
      string   denialReason "nullable"
      datetime occurredAt
  }

  MEMBERSHIP_CHANGE {
      bigint   id PK
      int      passengerId FK
      enum     fromLevel
      enum     toLevel
      int      changedByCrewLeadId FK
      datetime changedAt
  }
```

Relationships:
- Crew Lead creates Passenger (1 to many)
- Crew Lead provisions Resource (1 to many)
- Crew Lead authorises Membership Change (1 to many)
- Passenger attempts Usage Log (1 to many)
- Resource is target of Usage Log (1 to many)
- Passenger has history of Membership Change (1 to many)

Notes:
- Decommisions are soft deletes - preventing dangling foreign keys
- Usage Logs are a snapshot of levels at write time rather than joining live rows, so a later tier or resource change can never rewrites history.
- Usage Log has indexes for each report: by passenger, by resource, and by tier.

## 5. Folder structure

```
src/
  config/           env.ts, db.ts (mysql2 pool), logger.ts (minimal, no dependency)
  domain/           membership.ts (MembershipLevel, Role, canAccess), resource-category.ts,
                    errors.ts (AppError hierarchy), api-key.ts
  repositories/
    interfaces.ts   types every repository implements and every service is tested against
    mysql/          one file per entity: crew-lead, passenger, resource, usage-log,
                    membership-change — SQL queries + mapping to domain types
  services/         auth, passenger, resource, membership, access, reporting — one file per
                    concern, each wrapping its own repository
  http/
    app.ts          helmet, request logging, router mounting, error handler (last)
    middleware/     authenticate, require-role, validate, error-handler, request-logger
    routes/         health, passengers, resources, reports
    schemas/        Zod request schemas
  bootstrap.ts      boot-time script, idempotent crew-lead seeding
  server.ts         builds every repo/service inline and passes them into createApp
db/
  ddl.sql           the entire schema
tests/
  domain/
  services/
  http/middleware/
  integration/
x26.postman_collection.json   for manual verification test via postman
docker-compose.yml
.env.example
README.md
APPROACH.md
```

## 6. Dependencies

| Package | Purpose |
| --- | --- |
| `express` | web framework — v5's async handlers forward rejected promises to error middleware automatically, no manual wrapper needed |
| `mysql2` | MySQL driver with a promise API and prepared-statement placeholders (`connection.execute(sql, params)`) |
| `zod` | parses `unknown` request bodies into typed, whitelisted shapes — a request body can never carry an undeclared field like `role` |
| `helmet` | standard security headers |
| `typescript`, `tsx` | strict TypeScript; `tsx` runs it directly in dev (`--env-file` support needs Node ≥20.6, hence the `.nvmrc` pin to 22) |
| `jest`, `ts-jest` | unit test runner |
| `supertest`, `@types/supertest` | drives the integration suite (`tests/integration/usage.test.ts`) against the real app over HTTP |
| `eslint`, `typescript-eslint`, `eslint-config-prettier`, `@eslint/js`, `globals` | linting, scoped to `**/*.ts` only |
| `prettier` | formatting; deliberately excludes `*.md` via `.prettierignore` |
