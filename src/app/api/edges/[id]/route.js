import connectDB from "@/lib/mongodb";
import Edge from "@/models/Edge";
import { handle, unauthorized, notFound } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const DELETE = handle(async (req, { params }) => {
  if (!requireAdmin(req)) return unauthorized();
  await connectDB();
  const { id } = await params;
  const data = await Edge.findByIdAndDelete(id);
  if (!data) return notFound();
  return Response.json({ success: true });
});