# Codex Handoff

Read this first when Codex is opened on another development machine for this repo.

## Current Goal

The project should be developed from Windows or MacBook with Docker Compose. Both development machines connect to the shared MongoDB test database running on the Mac mini server.

Do not switch back to manual backend/frontend startup scripts unless the user explicitly asks for that. The standard flow is Docker Compose.

## Architecture

```text
Development machine:
  - Runs backend container
  - Runs frontend container
  - Uses local .env

Mac mini server:
  - Runs MongoDB test database in Docker
  - Tailscale IP: 100.90.120.55
  - MongoDB container: homelab-mongodb-test
  - Test database: app_test

Production:
  - Uses a separate MongoDB database
  - Must not point to app_test
```

## Important Files

- `docker-compose.yml`: starts backend and frontend for development.
- `Dockerfile.backend`: backend image.
- `frontend/Dockerfile`: frontend image.
- `.env.example`: template for local development secrets.
- `docs/development.md`: human development guide.
- `docs/mongodb-test-server.md`: Mac mini MongoDB operations.
- `scripts/sync_test_mongodb.sh`: refreshes test DB from a source MongoDB.
- `services/db_service.py`: backend reads MongoDB from `MONGODB_URI`.

Removed on purpose:

- `scripts/dev-windows.ps1`
- `scripts/dev-mac.sh`

Docker Compose is the shared startup path.

## Secret Handling

Never commit:

- `.env`
- `frontend/.env.local`
- `logs/*.log`
- real MongoDB URIs
- real passwords or API keys

The repo intentionally removed tracked log files because old logs contained DB connection strings.

Use placeholders in docs:

```env
MONGODB_URI="mongodb://angelo:<MONGO_TEST_PASSWORD>@100.90.120.55:27017/app_test?authSource=admin"
```

The user previously exposed DB passwords in chat. Remind them to rotate Atlas and Mac mini MongoDB passwords if they have not done so.

## First Checks On A New Machine

Run:

```bash
git status --short
git log --oneline -5
```

Then verify the local `.env` exists:

```bash
ls .env
```

If missing, create it from `.env.example` and ask the user to fill secrets locally. Do not ask the user to paste real passwords into chat.

Windows:

```powershell
copy .env.example .env
notepad .env
```

MacBook:

```bash
cp .env.example .env
nano .env
```

## Start Development

Make sure the Mac mini MongoDB is running:

```bash
ssh angelo@100.90.120.55
cd ~/server/mongodb-test
docker compose up -d
docker ps
```

The MongoDB container should show:

```text
homelab-mongodb-test
```

On the development machine:

```bash
docker compose up -d --build
```

URLs:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8001
```

Check backend connection:

```bash
docker compose logs -f backend
```

Expected log includes:

```text
MongoDB (db_service) connected successfully
```

## Refresh Test DB

Run this only when the user wants the Mac mini `app_test` database reset from another MongoDB source.

On the Mac mini:

```bash
SOURCE_URI='<CURRENT_MONGODB_URI>' \
TARGET_URI='mongodb://angelo:<MONGO_TEST_PASSWORD>@127.0.0.1:27017/app_test?authSource=admin' \
sh scripts/sync_test_mongodb.sh
```

This drops and restores target test collections. Do not run it against production.

## Git Workflow

Before editing:

```bash
git status --short
```

If the user asks to push:

```bash
git pull --rebase
git push
```

If there are uncommitted user changes, do not reset or revert them. Work around them or ask before touching related files.

## User-Facing Shortcut

Tell the user this is the shortest setup on another machine:

```bash
git pull
cp .env.example .env
# fill .env locally
docker compose up -d --build
```

For Windows PowerShell, replace the copy command with:

```powershell
copy .env.example .env
```
