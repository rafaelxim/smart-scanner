# Useful Commands

## Docker Compose

Build and start the stack in the foreground:

```bash
docker compose up --build
```

Build and start the stack in the background:

```bash
docker compose up --build -d
```

Start existing containers in the background:

```bash
docker compose up -d
```

Follow backend logs:

```bash
docker compose logs -f backend
```

Restart only the backend container:

```bash
docker compose restart backend
```

Show running Compose services:

```bash
docker compose ps
```

Stop and remove containers and the Compose network:

```bash
docker compose down
```

Stop and remove containers, network, and volumes:

```bash
docker compose down -v
```

## Backend

Run TypeScript checks across the monorepo:

```bash
pnpm typecheck
```

Build the backend TypeScript output:

```bash
pnpm --filter @smart-scanner/backend build
```

Start the backend locally from compiled output:

```bash
pnpm --filter @smart-scanner/backend start
```

Start the backend locally in watch mode:

```bash
pnpm --filter @smart-scanner/backend dev
```

Check the backend health endpoint:

```bash
curl http://localhost:3000/health
```

## SQLite

Copy a SQLite snapshot from the backend container:

```bash
docker compose cp backend:/data/smart-scanner.sqlite ./smart-scanner.sqlite
```

Open the copied snapshot with the SQLite CLI:

```bash
sqlite3 ./smart-scanner.sqlite
```

Useful SQLite shell commands:

```sql
.tables
.schema receipts
SELECT * FROM receipts;
.quit
```
