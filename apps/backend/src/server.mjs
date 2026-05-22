import { createServer } from "node:http";
import { dirname } from "node:path";
import { mkdir, open } from "node:fs/promises";

const host = process.env.BACKEND_HOST ?? "0.0.0.0";
const port = Number(process.env.BACKEND_PORT ?? "3000");
const sqliteDbPath = process.env.SQLITE_DB_PATH ?? "/data/smart-scanner.sqlite";
const uploadsDir = process.env.UPLOADS_DIR ?? "/uploads";

await mkdir(dirname(sqliteDbPath), { recursive: true });
await mkdir(uploadsDir, { recursive: true });

const dbFile = await open(sqliteDbPath, "a");
await dbFile.close();

const server = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        status: "ok",
        sqliteDbPath,
        uploadsDir,
      }),
    );
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "not_found" }));
});

server.listen(port, host, () => {
  console.log(`Backend listening on http://${host}:${port}`);
});
