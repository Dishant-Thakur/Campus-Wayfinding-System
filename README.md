# Campus Wayfinding System

A Next.js prototype for the P10 campus wayfinding problem. It includes a searchable campus directory, a graph-based walking route planner, destination QR codes, camera/manual QR lookup, and visitor assistance requests.

## Run locally

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>. Run `npm run lint`, `npm run build`, and with the development server running, `npm run test:smoke` for static and live API checks.

## Shared campus data

`src/data/campus.json` is the single source for directory entries, destination codes, schematic coordinates, route graph nodes and path segments. The map and location API read this file; the route service uses the same file for its weighted shortest-path calculation. The current dataset has 5 sample gates and 16 sample destinations, including 4 example rooms.

**This dataset is illustrative and unverified.** Building and room positions, paths, distances, route steps, and access information are not confirmed against the real campus. Do not use this sample graph for real-world navigation. Replace it with an approved campus survey and verified accessibility data before deployment.

## API

- `GET /api/locations` — directory, categories and gates.
- `GET /api/locations?q=...&category=...` — search and filter.
- `GET /api/locations?code=LPU-B34-R204` — resolve a destination/QR code.
- `POST /api/routes` — `{ "originId": "gate-1", "destinationId": "block-34-204" }`; returns route nodes, distance, estimate and instructions.
- `POST /api/assistance` — validates a visitor request and appends it to `data/assistance-requests.jsonl`.

Assistance submissions are saved to the local server filesystem. The prototype does not email staff or include an authenticated request inbox. For public or multi-instance deployment, configure an access-controlled database and a staff notification workflow.
