import { getCampusData } from "@/lib/campus-data";

export function calculateRoute(originId, destinationId) {
  const { locations, nodes, paths, metadata } = getCampusData();
  const origin = locations.find((place) => place.id === originId && place.type === "gate");
  const destination = locations.find((place) => place.id === destinationId);
  if (!origin) return { error: "Choose a valid campus gate as the starting point." };
  if (!destination) return { error: "Choose a destination from the campus directory." };
  const start = origin.nodeId;
  const finish = destination.nodeId;
  const distances = new Map(nodes.map(({ id }) => [id, Infinity]));
  const previous = new Map();
  const visited = new Set();
  distances.set(start, 0);
  while (true) {
    let current = null;
    let best = Infinity;
    for (const [id, distance] of distances) if (!visited.has(id) && distance < best) { current = id; best = distance; }
    if (current === null || current === finish) break;
    visited.add(current);
    for (const path of paths) {
      const neighbor = path.from === current ? path.to : path.to === current ? path.from : null;
      if (!neighbor) continue;
      const nextDistance = best + path.meters;
      if (nextDistance < (distances.get(neighbor) ?? Infinity)) { distances.set(neighbor, nextDistance); previous.set(neighbor, { from: current, path }); }
    }
  }
  if (!Number.isFinite(distances.get(finish))) return { error: "No connected walking route is available for that gate and destination." };
  const routeNodes = [finish];
  const steps = [];
  let cursor = finish;
  while (cursor !== start) {
    const link = previous.get(cursor);
    if (!link) return { error: "The route graph could not be traced. Please choose another destination." };
    steps.unshift({ instruction: link.path.instruction, distanceMeters: link.path.meters, fromNode: link.from, toNode: cursor });
    cursor = link.from;
    routeNodes.unshift(cursor);
  }
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const totalMeters = distances.get(finish);
  return { origin, destination, steps, nodes: routeNodes.map((id) => nodeById.get(id)), totalMeters, estimatedMinutes: Math.max(1, Math.ceil(totalMeters / 75)), notice: metadata.notice };
}
