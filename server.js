const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

loadEnvFile();

const PORT = Number(process.env.PORT || 8000);
const PUBLIC_DIR = __dirname;
const orders = [];

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = valueParts.join("=").trim();
  }
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function serveStatic(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const safePath = path.normalize(decodeURIComponent(requestedPath)).replace(/^[/\\]+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(response, 404, { error: "Not found" });
      return;
    }

    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(data);
  });
}

async function handleApi(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && requestUrl.pathname === "/api/config") {
    sendJson(response, 200, {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
      defaultCenter: { lat: 28.6139, lng: 77.209 },
      deliveryRadiusKm: 4,
    });
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/orders") {
    try {
      const body = await readRequestBody(request);
      const order = JSON.parse(body || "{}");

      if (!Array.isArray(order.items) || order.items.length === 0) {
        sendJson(response, 400, { error: "Order must include at least one item" });
        return;
      }

      const savedOrder = {
        id: randomUUID(),
        items: order.items,
        total: Number(order.total || 0),
        address: String(order.address || ""),
        createdAt: new Date().toISOString(),
        status: "accepted",
        etaMinutes: 10,
      };
      orders.push(savedOrder);
      sendJson(response, 201, savedOrder);
    } catch (error) {
      sendJson(response, 400, { error: "Invalid order payload" });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/orders") {
    sendJson(response, 200, { orders });
    return;
  }

  sendJson(response, 404, { error: "API endpoint not found" });
}

const server = http.createServer((request, response) => {
  if (request.url.startsWith("/api/")) {
    handleApi(request, response);
    return;
  }
  serveStatic(request, response);
});

server.listen(PORT, () => {
  console.log(`FlashBasket server running at http://localhost:${PORT}`);
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.log("Tip: set GOOGLE_MAPS_API_KEY to enable the Google Map on the website.");
  }
  });
