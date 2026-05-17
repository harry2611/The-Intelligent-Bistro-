import http from "node:http";
import { menu } from "./menu.js";
import { getAiProvider, processOrderIntent } from "./aiOrder.js";

const port = Number(process.env.PORT ?? 4000);

const server = http.createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      ai: getAiProvider()
    });
    return;
  }

  if (request.method === "GET" && request.url === "/menu") {
    sendJson(response, 200, { menu });
    return;
  }

  if (request.method === "POST" && request.url === "/ai/order") {
    try {
      const body = await readJson(request);
      const result = await processOrderIntent(body.message, body.cart);
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 400, {
        error: "Invalid request",
        detail: error instanceof Error ? error.message : "Unknown error"
      });
    }
    return;
  }

  sendJson(response, 404, { error: "Not found" });
});

server.listen(port, () => {
  console.log(`Order assistant API running on http://localhost:${port}`);
});

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
