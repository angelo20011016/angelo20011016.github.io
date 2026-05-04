# Development Guide

This project can be developed from multiple machines while sharing one MongoDB test database on the Mac mini server.

## Environment Layout

```text
Windows development machine: runs backend and frontend
MacBook development machine: runs backend and frontend
Mac mini server: runs MongoDB test database only
Production: uses a separate MongoDB database
```

Rules:

- Keep `.env` local to each machine.
- Do not commit `.env`, logs, or real passwords.
- Development machines connect to the Mac mini test DB through Tailscale.
- Production must not point to `app_test`.

## Shared Test Database

Mac mini MongoDB:

```text
Host: 100.90.120.55
Port: 27017
Database: app_test
Container: homelab-mongodb-test
```

Each development machine should have this in its local `.env`:

```env
MONGODB_URI="mongodb://angelo:<MONGO_TEST_PASSWORD>@100.90.120.55:27017/app_test?authSource=admin"
```

Use `.env.example` as the template.

## Start MongoDB On Mac Mini

On the Mac mini:

```bash
cd ~/server/mongodb-test
docker compose up -d
docker ps
```

The container should be listed as:

```text
homelab-mongodb-test
```

## Start The App On Any Development Machine

Use the same Docker Compose flow on Windows and MacBook.

Windows PowerShell:

```powershell
cd D:\projects\angelo20011016.github.io
docker compose up -d --build
```

MacBook Terminal:

```bash
cd ~/path/to/angelo20011016.github.io
docker compose up -d --build
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8001
```

Check backend logs:

```bash
docker compose logs -f backend
```

Stop the app:

```bash
docker compose down
```

## First Setup On Another Machine

1. Clone or pull the repo.
2. Copy `.env.example` to `.env`.
3. Fill in local secrets, especially `MONGODB_URI`.
4. Install Docker Desktop.
5. Start with Docker Compose.

Windows:

```powershell
git pull
copy .env.example .env
notepad .env
docker compose up -d --build
```

MacBook:

```bash
git pull
cp .env.example .env
nano .env
docker compose up -d --build
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8001
```

## Refresh Test Data

When the test DB should match the current source DB again, run on the Mac mini:

```bash
SOURCE_URI='<CURRENT_MONGODB_URI>' \
TARGET_URI='mongodb://angelo:<MONGO_TEST_PASSWORD>@127.0.0.1:27017/app_test?authSource=admin' \
sh scripts/sync_test_mongodb.sh
```

This drops and restores the target test collections. Use it only for the test DB.

## When Data Shape Changes

MongoDB does not require SQL-style table migrations for optional new fields. Use this rule:

- Optional field added: update code defaults; no DB action usually needed.
- Required field added: write a migration script to backfill old documents.
- Field renamed or removed: write a migration script and test it on `app_test` first.
- Test DB can be reset: use `scripts/sync_test_mongodb.sh`.
