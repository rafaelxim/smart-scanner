## Especificacao

Create the baseline Docker setup for local development and demo use.
The setup should support the backend container, persistent SQLite storage, and a mounted uploads directory.

## Entregavel

- Root `docker-compose.yml`
- Backend Dockerfile
- Persistent Docker volume for SQLite data
- Persistent Docker volume or mounted path for uploaded image files
- Root environment example file for local configuration

## Definicao de pronto

- `docker compose up` starts the backend stack locally
- SQLite data survives container restarts
- Uploaded images survive container restarts
- The environment file documents the minimum required variables

## Teste

- Start the stack with Docker Compose
- Restart the backend container and confirm the database still exists
- Confirm uploaded files remain on disk after restart

