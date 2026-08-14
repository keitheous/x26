# Spaceship X26 — Passenger Resource Management System

## Prerequisites

- **Node.js 22** (pinned via [.nvmrc](.nvmrc) — run `nvm use` if you have nvm installed)
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
docker compose down -v   # to deleet the data volume
docker compose up -d     # to reapply db/ddl.sql from scratch
```

## Tests

Running unit test without DB
```
npm test
```
