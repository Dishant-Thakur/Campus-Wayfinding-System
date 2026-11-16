import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);
const locs = mongoose.connection.collection("locations");
const edges = mongoose.connection.collection("edges");
await locs.deleteMany({});
await edges.deleteMany({});

const now = new Date();
const nodes = [
  { code: "gate-1", lat: 31.2535, lng: 75.702, name: "Gate 1", type: "gate", keywords: ["main gate", "entrance"] },
  { code: "gate-2", lat: 31.257, lng: 75.708, name: "Gate 2", type: "gate", keywords: [] },
  { code: "block-32", lat: 31.2548, lng: 75.7035, name: "Block 32", type: "block", keywords: [] },
  { code: "block-33", lat: 31.2553, lng: 75.7045, name: "Block 33", type: "block", keywords: [] },
  { code: "block-34", lat: 31.2558, lng: 75.7055, name: "Block 34", type: "block", keywords: [] },
  { code: "library", lat: 31.2545, lng: 75.7028, name: "Library", type: "facility", keywords: ["books"] },
  { code: "food-court", lat: 31.256, lng: 75.7065, name: "Food Court", type: "landmark", keywords: ["canteen"] },
];
const r = await locs.insertMany(
  nodes.map((n) => ({ accessible: true, ...n, qrCode: n.code, createdAt: now, updatedAt: now, __v: 0 }))
);
const id = (c) => r.insertedIds[nodes.findIndex((n) => n.code === c)];

await locs.insertMany([
  { code: "34-101", name: "Room 34-101", type: "room", parent: id("block-34"), floor: 1, keywords: [], accessible: true, qrCode: "34-101", createdAt: now, updatedAt: now, __v: 0 },
  { code: "34-305", name: "Room 34-305", type: "room", parent: id("block-34"), floor: 3, keywords: [], accessible: true, qrCode: "34-305", createdAt: now, updatedAt: now, __v: 0 },
]);

const e = [
  ["gate-1", "block-32", 300, true, "Walk straight from Gate 1 to Block 32"],
  ["block-32", "block-33", 150, true, null],
  ["block-33", "block-34", 120, true, null],
  ["gate-1", "library", 250, true, null],
  ["library", "food-court", 100, true, null],
  ["food-court", "block-34", 200, false, "Take the stairs path behind the food court to Block 34"],
  ["gate-2", "food-court", 350, true, null],
];
await edges.insertMany(
  e.map(([a, b, d, acc, ins]) => ({ from: id(a), to: id(b), distance: d, accessible: acc, instruction: ins, createdAt: now, updatedAt: now, __v: 0 }))
);

console.log("seeded");
await mongoose.disconnect();