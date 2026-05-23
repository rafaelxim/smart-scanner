## Especificacao

Replace SQLite as the target local database by adding MySQL to Docker Compose.
The backend should connect to MySQL through environment variables.

## Entregavel

- MySQL service in `docker-compose.yml`
- Persistent MySQL volume
- Backend environment variables for database connection
- Updated `.env.example`

## Definicao de pronto

- `docker compose up` starts backend and MySQL
- MySQL data survives container restarts
- Backend has a documented `DATABASE_URL`

## Teste

- Start the Compose stack
- Confirm MySQL is healthy/reachable from the backend container
- Restart containers and confirm MySQL data persists
