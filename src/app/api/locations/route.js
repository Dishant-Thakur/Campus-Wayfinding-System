import connectDB from "@/lib/mongodb";
import Location from "@/models/Location";
import { handle, unauthorized } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { esc } from "@/lib/find";

export const GET = handle(async (req) => {
  await connectDB();
  const p = new URL(req.url).searchParams;
  const filter = {};
  const q = p.get("q");
  if (q) {
    const r = new RegExp(esc(q), "i");
    filter.$or = [{ name: r }, { code: r }, { keywords: r }];
  }
  if (p.get("type")) filter.type = p.get("type");
  if (p.get("parent")) filter.parent = p.get("parent");
  const limit = Math.min(Number(p.get("limit")) || 50, 200);
  const data = await Location.find(filter).sort({ name: 1 }).limit(limit).lean();
  return Response.json({ data });
});

export const POST = handle(async (req) => {
  if (!requireAdmin(req)) return unauthorized();
  await connectDB();
  const body = await req.json();
  if (!body.qrCode && body.code) body.qrCode = String(body.code).toLowerCase();
  const data = await Location.create(body);
  return Response.json({ data }, { status: 201 });
}); 