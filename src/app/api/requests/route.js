import connectDB from "@/lib/mongodb";
import VisitorRequest from "@/models/VisitorRequest";
import { handle, unauthorized } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const POST = handle(async (req) => {
  await connectDB();
  const { name, email, phone, type, message, location } = await req.json();
  const data = await VisitorRequest.create({ name, email, phone, type, message, location: location || null });
  return Response.json({ data }, { status: 201 });
});

export const GET = handle(async (req) => {
  if (!requireAdmin(req)) return unauthorized();
  await connectDB();
  const status = new URL(req.url).searchParams.get("status");
  const data = await VisitorRequest.find(status ? { status } : {})
    .populate("location", "name code")
    .sort({ createdAt: -1 })
    .lean();
  return Response.json({ data });
});