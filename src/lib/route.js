import connectDB from "@/lib/mongodb";
import Location from "@/models/Location";
import Edge from "@/models/Edge";
import { findLocation } from "@/lib/find";

const WALK_M_PER_MIN = 80;

export async function planRoute(fromQ, toQ, accessibleOnly = false) {
  await connectDB();
  const from = await findLocation(fromQ);
  const to = await findLocation(toQ);
  if (!from || !to) return { error: "Location not found", status: 404 };

  const locs = await Location.find().lean();
  const byId = new Map(locs.map((l) => [String(l._id), l]));
  const nodeOf = (l) => (l.parent ? String(l.parent) : String(l._id));
  const s = nodeOf(from);
  const t = nodeOf(to);
  if (!byId.has(s) || !byId.has(t)) return { error: "Invalid location hierarchy", status: 400 };

  const edges = await Edge.find(accessibleOnly ? { accessible: true } : {}).lean();
  const adj = new Map();
  const add = (a, b, dist, instruction) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push({ to: b, dist, instruction });
  };
  for (const e of edges) {
    add(String(e.from), String(e.to), e.distance, e.instruction);
    add(String(e.to), String(e.from), e.distance, null);
  }

  const dist = new Map([[s, 0]]);
  const prev = new Map();
  const done = new Set();
  while (true) {
    let u = null;
    let best = Infinity;
    for (const [k, d] of dist) if (!done.has(k) && d < best) { best = d; u = k; }
    if (u === null || u === t) break;
    done.add(u);
    for (const e of adj.get(u) || []) {
      const nd = best + e.dist;
      if (nd < (dist.get(e.to) ?? Infinity)) {
        dist.set(e.to, nd);
        prev.set(e.to, { from: u, edge: e });
      }
    }
  }
  if (!dist.has(t)) return { error: "No route found", status: 404 };

  const path = [];
  const steps = [];
  let cur = t;
  while (cur !== s) {
    const p = prev.get(cur);
    path.unshift(cur);
    steps.unshift({
      instruction: p.edge.instruction || `Walk ${Math.round(p.edge.dist)} m to ${byId.get(cur).name}`,
      distance: p.edge.dist,
      to: byId.get(cur).name,
    });
    cur = p.from;
  }
  path.unshift(s);

  const startNode = byId.get(s);
  const endNode = byId.get(t);
  const out = [];
  if (from.parent) out.push({ instruction: `Exit ${from.name} and head out of ${startNode.name}`, distance: 0, to: startNode.name });
  out.push(...steps);
  if (to.parent) {
    const fl = to.floor != null ? `, go to floor ${to.floor}` : "";
    out.push({ instruction: `Enter ${endNode.name}${fl} and find ${to.name}`, distance: 0, to: to.name });
  }

  const total = dist.get(t);
  return {
    from: { id: from._id, name: from.name, code: from.code },
    to: { id: to._id, name: to.name, code: to.code, floor: to.floor ?? null },
    accessibleOnly,
    totalDistance: total,
    estimatedMinutes: Math.max(1, Math.ceil(total / WALK_M_PER_MIN)),
    path: path.map((id) => ({ id, name: byId.get(id).name, lat: byId.get(id).lat ?? null, lng: byId.get(id).lng ?? null })),
    steps: out,
  };
}