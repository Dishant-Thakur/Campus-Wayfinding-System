import connectDB from "@/lib/mongodb";
import Location from "@/models/Location";
import { handle, notFound } from "@/lib/api";
import { planRoute } from "@/lib/route";

export const GET = handle(async (req, { params }) => {
  await connectDB();
  const { code } = await params;
  const loc = await Location.findOne({ $or: [{ qrCode: code }, { code: code.toLowerCase() }] }).lean();
  if (!loc) return notFound("Invalid QR code");
  const p = new URL(req.url).searchParams;
  let route = null;
  if (p.get("to")) {
    const r = await planRoute(String(loc._id), p.get("to"), p.get("accessible") === "true");
    if (r.error) return Response.json({ error: r.error }, { status: r.status });
    route = r;
  }
  return Response.json({ data: loc, route });
});