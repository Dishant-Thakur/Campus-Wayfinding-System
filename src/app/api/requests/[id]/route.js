import connectDB from "@/lib/mongodb";
import VisitorRequest from "@/models/VisitorRequest";
import { handle, unauthorized, notFound } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const PATCH = handle(async (req, { params }) => {
  if (!requireAdmin(req)) return unauthorized();
  await connectDB();
  const { id } = await params;
  const { status, adminNote } = await req.json();
  const update = {};
  if (status) update.status = status;
  if (adminNote !== undefined) update.adminNote = adminNote;
  const data = await VisitorRequest.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!data) return notFound();
  return Response.json({ data });
});