import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import fs from "node:fs";
import mongoose from "mongoose";

const file = process.argv[2];
const dry = process.argv.includes("--dry");
if (!file) {
  console.log("usage: node --env-file=.env.local scripts/import-osm.mjs scripts/data/osm.json [--dry]");
  process.exit(1);
}

const WALK_FACTOR = 1.3;
const NEIGHBOURS = 3;

const rad = (d) => (d * Math.PI) / 180;
function meters(a, b) {
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const TYPES = ["gate", "block", "room", "landmark", "facility"];

function csvElements(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !/^name\s*,/i.test(l))
    .map((l, i) => {
      const [name, type, lat, lng] = l.split(",").map((x) => x.trim());
      if (!name || !TYPES.includes(type) || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
        console.log(`skipping line ${i + 1}: ${l}`);
        return null;
      }
      return { tags: { name, _type: type }, lat: Number(lat), lon: Number(lng) };
    })
    .filter(Boolean);
}

function classify(name, tags) {
  if (tags._type) return tags._type;
  if (/gate/i.test(name) || tags.barrier === "gate" || tags.entrance) return "gate";
  if (/\bblock\b/i.test(name)) return "block";
  if (/hostel|mall|library|hospital|ground|stadium|auditorium|mess|canteen|food|court|bank|atm|gym|pool|market|cafe|restaurant|store|clinic|pharmacy/i.test(name) || tags.amenity || tags.leisure || tags.shop) return "facility";
  return "landmark";
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const text = fs.readFileSync(file, "utf8");
let elements;
if (file.toLowerCase().endsWith(".csv")) {
  elements = csvElements(text);
} else {
  const raw = JSON.parse(text);
  elements = raw.elements || (raw.features || []).map((f) => ({
    tags: f.properties || {},
    lat: f.geometry?.coordinates?.[1],
    lon: f.geometry?.coordinates?.[0],
  }));
}

const seenNames = new Set();
const seenCodes = new Set();
const locations = [];
for (const el of elements) {
  const tags = el.tags || {};
  const name = (tags.name || "").trim();
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!name || lat == null || lng == null) continue;
  if (seenNames.has(name.toLowerCase())) continue;
  seenNames.add(name.toLowerCase());
  let code = slug(name) || "location";
  let n = 2;
  while (seenCodes.has(code)) code = `${slug(name)}-${n++}`;
  seenCodes.add(code);
  locations.push({
    name,
    code,
    qrCode: code,
    type: classify(name, tags),
    lat,
    lng,
    description: tags.description || "",
    keywords: [tags.amenity, tags.building, tags["name:en"]].filter(Boolean),
    accessible: tags.wheelchair !== "no",
    parent: null,
  });
}

const pairs = new Map();
const addPair = (i, j) => {
  const key = i < j ? `${i}-${j}` : `${j}-${i}`;
  if (!pairs.has(key)) pairs.set(key, [Math.min(i, j), Math.max(i, j)]);
};
locations.forEach((a, i) => {
  locations
    .map((b, j) => ({ j, d: i === j ? Infinity : meters(a, b) }))
    .sort((x, y) => x.d - y.d)
    .slice(0, NEIGHBOURS)
    .forEach(({ j }) => addPair(i, j));
});

const parent = locations.map((_, i) => i);
const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
for (const [i, j] of pairs.values()) parent[find(i)] = find(j);

while (new Set(locations.map((_, i) => find(i))).size > 1) {
  let best = null;
  for (let i = 0; i < locations.length; i++)
    for (let j = i + 1; j < locations.length; j++)
      if (find(i) !== find(j)) {
        const d = meters(locations[i], locations[j]);
        if (!best || d < best.d) best = { i, j, d };
      }
  addPair(best.i, best.j);
  parent[find(best.i)] = find(best.j);
}

const edgeDefs = [...pairs.values()].map(([i, j]) => ({
  i,
  j,
  distance: Math.max(10, Math.round(meters(locations[i], locations[j]) * WALK_FACTOR)),
}));

const counts = locations.reduce((a, l) => ((a[l.type] = (a[l.type] || 0) + 1), a), {});
console.log("locations:", locations.length, counts);
console.log("connections:", edgeDefs.length);

if (dry) process.exit(0);

await mongoose.connect(process.env.MONGODB_URI);
const locCol = mongoose.connection.collection("locations");
const edgeCol = mongoose.connection.collection("edges");
await locCol.deleteMany({});
await edgeCol.deleteMany({});
const now = new Date();
const res = await locCol.insertMany(locations.map((l) => ({ ...l, createdAt: now, updatedAt: now, __v: 0 })));
await edgeCol.insertMany(
  edgeDefs.map((e) => ({
    from: res.insertedIds[e.i],
    to: res.insertedIds[e.j],
    distance: e.distance,
    accessible: true,
    instruction: "",
    createdAt: now,
    updatedAt: now,
    __v: 0,
  }))
);
console.log("imported");
await mongoose.disconnect();
