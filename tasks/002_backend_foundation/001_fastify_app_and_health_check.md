## Especificacao

Create the backend application using Fastify and TypeScript.
Add the health check endpoint and the basic server bootstrap needed for local development and Docker.

## Entregavel

- Fastify server entrypoint
- Health check endpoint
- Local dev start script
- Docker-compatible backend startup flow

## Definicao de pronto

- The backend starts without manual patching
- `GET /health` returns a successful response
- The backend runs both locally and inside Docker

## Teste

- Send a request to the health check endpoint
- Start the backend locally and verify the same endpoint works
- Start the backend in Docker and verify the same endpoint works

