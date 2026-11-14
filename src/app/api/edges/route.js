
import connectDB from "@/lib/mongodb";
import Edge from "@/models/Edge";
import { handle, unauthorized } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const GET = handle(async (req) => {
  if (!requireAdmin(req)) return unauthorized();
  await connectDB();
  const data = await Edge.find().populate("from to", "name code").lean();
  return Response.json({ data });
});

export const POST = handle(async (req) => {
  if (!requireAdmin(req)) return unauthorized();
  await connectDB();
  const data = await Edge.create(await req.json());
  return Response.json({ data }, { status: 201 });
});