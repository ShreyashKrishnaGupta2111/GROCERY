+37
-1

# GROCERY
GROCERY

A high-energy grocery ordering website inspired by quick-commerce experiences such as Blinkit. It includes a sticky navigation bar, public-attention offer ticker, animated hero section, smart product search, category filters, grocery categories, lightning deal cards, Google Maps delivery-area preview, editable cart drawer, backend order API, and a professional service promise section.

## How the files are connected

- `package.json` starts the app with `npm start`, which runs `server.js`.
- `server.js` serves `index.html`, `/styles.css`, and `/script.js`, validates that those frontend files exist at startup, and exposes backend APIs under `/api/*`.
- `index.html` links `/styles.css` for the design and `/script.js` for all product, cart, checkout, delivery-form, and Google Maps behavior.
- `script.js` calls `/api/config` to load the Google Maps key safely from the backend and calls `/api/orders` when checkout is submitted.
- `.env.example` documents the local `GOOGLE_MAPS_API_KEY` and `PORT` variables. Your real `.env` stays private because `.gitignore` excludes it.

## Run locally

1. Copy the example environment file and add your Google Maps browser key:

```bash
cp .env.example .env
```

2. Edit `.env` and set `GOOGLE_MAPS_API_KEY` to your Google Maps JavaScript API key.

3. Start the connected backend + frontend server:

```bash
npm start
```

Then visit `http://localhost:8000`.

## Backend endpoints

- `GET /api/health` confirms the backend is running, the frontend files are connected, and whether Google Maps is configured.
- `GET /api/config` returns the public Google Maps key and default delivery map settings.
- `POST /api/orders` accepts cart items, address, and total, then returns an accepted order with an ETA.
- `GET /api/orders` returns in-memory orders for local testing.

> Keep `.env` private. For production, restrict the Google Maps browser key by HTTP referrer in Google Cloud Console
