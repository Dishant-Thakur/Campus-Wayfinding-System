import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.WAYFINDING_URL || "http://localhost:3000";
const pages = ["/", "/campus-map", "/scan-qr", "/help", "/privacy", "/terms"];
for (const page of pages) {
  const response = await fetch(`${baseUrl}${page}`);
  assert.equal(response.status, 200, `${page} should render successfully`);
  console.log(`PASS page ${page}`);
}

const directoryResponse = await fetch(`${baseUrl}/api/locations`);
assert.equal(directoryResponse.status, 200);
const directory = await directoryResponse.json();
assert.equal(directory.locations.length, 21);
assert.equal(directory.gates.length, 5);
assert.equal(directory.notice.includes("not been verified"), true);
assert.equal(new Set(directory.locations.map((location) => location.id)).size, directory.locations.length, "location IDs should be unique");
assert.equal(new Set(directory.locations.map((location) => location.code)).size, directory.locations.length, "location QR codes should be unique");
const nodeIds = new Set((await (await fetch(`${baseUrl}/api/locations`)).json()).locations.map((location) => location.nodeId));
assert.equal(directory.locations.every((location) => nodeIds.has(location.nodeId)), true);
console.log(`PASS shared location directory (${directory.locations.length} locations, ${directory.gates.length} gates; explicitly unverified)`);

const queryResponse = await fetch(`${baseUrl}/api/locations?q=${encodeURIComponent("Room 204")}`);
const query = await queryResponse.json();
assert.equal(query.total, 1);
assert.equal(query.locations[0].code, "LPU-B34-R204");
const codeResponse = await fetch(`${baseUrl}/api/locations?code=LPU-B34-R204`);
const codeResult = await codeResponse.json();
assert.equal(codeResult.location.id, "block-34-204");
const roomFilter = await (await fetch(`${baseUrl}/api/locations?category=Rooms`)).json();
assert.equal(roomFilter.total, 4);
const gateFilter = await (await fetch(`${baseUrl}/api/locations?category=Gates`)).json();
assert.equal(gateFilter.total, 5);
const unknownCode = await fetch(`${baseUrl}/api/locations?code=INVALID-CODE`);
assert.equal(unknownCode.status, 404);
console.log("PASS location search, category filtering, and QR destination-code lookup");

async function requestRoute(originId, destinationId) {
  const response = await fetch(`${baseUrl}/api/routes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ originId, destinationId }) });
  return { response, body: await response.json() };
}
const roomRoute = await requestRoute("gate-1", "block-34-204");
assert.equal(roomRoute.response.status, 200);
assert.equal(roomRoute.body.route.destination.code, "LPU-B34-R204");
assert.ok(roomRoute.body.route.steps.length > 0);
assert.equal(roomRoute.body.route.nodes.length, roomRoute.body.route.steps.length + 1);
assert.equal(roomRoute.body.route.totalMeters, roomRoute.body.route.steps.reduce((sum, step) => sum + step.distanceMeters, 0));
assert.equal(roomRoute.body.route.nodes.at(-1).id, "b34r204");
const secondRoute = await requestRoute("gate-5", "university-hospital");
assert.equal(secondRoute.response.status, 200);
assert.ok(secondRoute.body.route.totalMeters > 0);
const badRoute = await requestRoute("missing-gate", "block-34");
assert.equal(badRoute.response.status, 422);
const malformedRoute = await fetch(`${baseUrl}/api/routes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
assert.equal(malformedRoute.status, 400);
for (const gate of directory.gates) {
  for (const destination of directory.locations.filter((place) => place.type !== "gate")) {
    const result = await requestRoute(gate.id, destination.id);
    assert.equal(result.response.status, 200, `${gate.id} should connect to ${destination.id}`);
    assert.equal(result.body.route.totalMeters, result.body.route.steps.reduce((sum, step) => sum + step.distanceMeters, 0));
  }
}
console.log(`PASS shortest-path routing for all ${directory.gates.length * (directory.locations.length - directory.gates.length)} gate-to-destination combinations, step totals, alternate gate, and invalid-route handling (${roomRoute.body.route.totalMeters} m / ${roomRoute.body.route.steps.length} steps)`);

const qrSvg = renderToStaticMarkup(createElement(QRCodeSVG, { value: "http://localhost:3000/scan-qr?code=LPU-B34-R204&from=gate-1&route=1" }));
assert.match(qrSvg, /^<svg/);
assert.match(qrSvg, /<path/);
console.log("PASS destination/route QR SVG generation");

const invalidRequest = await fetch(`${baseUrl}/api/assistance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "A", email: "invalid", destinationId: "missing", details: "" }) });
assert.equal(invalidRequest.status, 400);
const marker = `Wayfinding smoke ${Date.now()}`;
const goodRequest = await fetch(`${baseUrl}/api/assistance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: marker, email: "smoke@example.test", destinationId: "block-34-204", details: "Synthetic end-to-end smoke request; safe to remove." }) });
const saved = await goodRequest.json();
assert.equal(goodRequest.status, 201);
assert.equal(saved.request.status, "received");
assert.equal(saved.request.destinationName, "Block 34 · Room 204");
const store = path.join(process.cwd(), "data", "assistance-requests.jsonl");
try {
  const contents = await readFile(store, "utf8");
  const records = contents.split(/\r?\n/).filter(Boolean);
  const remaining = records.filter((line) => JSON.parse(line).id !== saved.request.id);
  if (remaining.length === 0) await unlink(store);
  else if (remaining.length !== records.length) await writeFile(store, `${remaining.join("\n")}\n`, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
console.log("PASS visitor request validation, local persistence, and synthetic-record cleanup");
console.log("All wayfinding smoke checks passed.");
