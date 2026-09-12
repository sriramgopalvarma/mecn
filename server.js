import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const port = 5000;
const host = process.env.APP_HOST ?? "0.0.0.0";
const projectRoot = dirname(fileURLToPath(import.meta.url));
const backendPath = join(projectRoot, "backend", "MeconApp.exe");

if (!existsSync(backendPath)) {
  console.error("Missing backend\\MeconApp.exe. Publish the .NET backend before starting the production app.");
  process.exit(1);
}

const dotnet = spawn(backendPath, [], {
  cwd: projectRoot,
  stdio: "inherit",
  windowsHide: true
});

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mecon App</title>
  <style>
    :root { font-family: system-ui, sans-serif; color: #17202a; background: #eef3f7; }
    body { display: grid; min-height: 100vh; place-items: center; margin: 0; }
    main { width: min(90vw, 560px); padding: 3rem; text-align: center; background: white; border-radius: 16px; box-shadow: 0 12px 36px #17202a22; }
    h1 { margin-top: 0; color: #176b87; }
    #status { min-height: 1.5em; color: #53636e; }
  </style>
</head>
<body><main><h1>Mecon App neww three</h1><p>Node.js UI + .NET backend</p><p id="status">Loading backend status...</p></main>
<script>
  fetch('/api/status')
    .then(response => response.json())
    .then(data => document.querySelector('#status').textContent = data.Message)
    .catch(() => document.querySelector('#status').textContent = 'Backend unavailable');
</script></body>
</html>`;

const server = createServer(async (request, response) => {
  if (request.url === "/" && request.method === "GET") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(page);
    return;
  }

  if (request.url === "/api/status" && request.method === "GET") {
    try {
      const backendResponse = await fetch("http://localhost:5001/api/status");
      response.writeHead(backendResponse.status, { "Content-Type": "application/json; charset=utf-8" });
      response.end(await backendResponse.text());
    } catch {
      response.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ Message: "Backend unavailable" }));
    }
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

server.listen(port, host, () => {
  console.log(`Mecon App listening on ${host}:${port}`);
});

const shutdown = () => {
  server.close();
  dotnet.kill();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
