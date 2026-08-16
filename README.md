# Spaceship X26 — Passenger Resource Management System

This README covers running the app locally.

For the architecture, REST API reference, data model, and known gaps, see [APPROACH.md](APPROACH.md).

For the reuirements, see [REQUIREMENTS](REQUIREMENTS.md)
## Prerequisites

- **Node.js 22** (pinned via [.nvmrc](.nvmrc)) —
  - No nvm yet? Install it first: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`, then restart your shell.
  - Already have nvm? From the project root: `nvm install` (reads `.nvmrc`, installs 22 if you don't have it) then `nvm use`.
  - Check you're actually on it before running anything else: `node --version` should print `v22.x.x`.
- **Docker Desktop** (Mac/Windows) or **Docker Engine + the Compose plugin** (Linux) — needs to support the `docker compose` command (Compose v2), not the older standalone `docker-compose` binary
- **npm** for node package management.

## Database (local MySQL via Docker)

The schema lives entirely in [db/ddl.sql](db/ddl.sql) — there's no separate migration step. Running `docker-compose.yml` mounts it into the MySQL container's
`docker-entrypoint-initdb.d/`, and MySQL runs it automatically the first time the container starts against an empty data volume.

```
cp .env.example .env   # first start (once only)

docker compose up -d   # to boot mysql:8 and apply db/ddl.sql on first start
```

Check it's ready before connecting:

```
docker compose ps      # to check all containers
```

**Stopping:**

```
docker compose down    # to stop and remove the container
```

**Resetting**

```
docker compose down -v   # to delete the data volume
docker compose up -d     # to reapply db/ddl.sql from scratch
```

## Running the app

```
npm run dev     # tsx watch --env-file=.env src/server.ts — auto-restarts on file changes
```

or, for a production-style run:

```
npm run build   # tsc -p tsconfig.json -> dist/
npm start       # node --env-file=.env dist/server.js
```

## Tests / Linting / Type-checking

Running unit test without DB
```
npm test
```

Lint and Typecheck the codebase
```
npm run lint

npm run typecheck
```

Integration tests (needs `docker compose up -d` running first — these hit a real MySQL, not a mock)
```
npm run test:integration
```

**Crew Leads are seeded automatically at boot, not via a separate command.** The first time the
server starts against an empty `crew_leads` table, it creates the 3 Crew Leads and prints their
plaintext API keys to stdout — this is the only time they're shown, since only the SHA-256 hash is
stored afterward. Every later restart is a no-op (the table already has 3 rows), so there's nothing
to re-run and no `npm run seed` step.

## Manual verification (Postman)

[x26.postman_collection.json](x26.postman_collection.json) walks through the API end to end:
  -> health check
  -> create a passenger as a Crew Lead
  -> list passengers
  -> upgrade/downgrade that passenger's membership level
  -> provision two resources at different tiers
  -> view accessible resources as that passenger (tier-filtered)
  -> use a resource (both a granted case and a denied case)
  -> view that passenger's own usage history
  -> view the usage-by-level and resource-demand reports as a Crew Lead
  -> decommission a resource, then see usage of it denied regardless of tier
  -> deactivate a passenger

To Import collection, variables and query params:

1. Postman → **Import** → **Files** tab (not "Link") → select `x26.postman_collection.json`.
2. With `docker compose up -d` and `npm run dev` already running, copy one of the Crew Lead API
   keys printed to stdout on first boot.
3. Collection → **Variables** tab → paste it into `crewLeadApiKey`'s Current Value → save.
4. Run the requests top to bottom. "Create Passenger" auto-captures `passengerId`/`passengerApiKey`
   into the collection variables via a test script — nothing else to copy by hand.

