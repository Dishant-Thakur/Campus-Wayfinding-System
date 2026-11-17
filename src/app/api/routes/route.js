import { NextResponse } from "next/server";
import { calculateRoute } from "@/lib/route-planner";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Send a JSON object with originId and destinationId." }, { status: 400 }); }
  if (typeof body?.originId !== "string" || typeof body?.destinationId !== "string") return NextResponse.json({ error: "Choose both a starting gate and a destination." }, { status: 400 });
  const route = calculateRoute(body.originId, body.destinationId);
  if (route.error) return NextResponse.json({ error: route.error }, { status: 422 });
  return NextResponse.json({ route });
}
