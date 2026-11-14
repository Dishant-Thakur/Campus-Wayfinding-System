import connectDB from "@/lib/mongodb";
import Location from "@/models/Location";
import Edge from "@/models/Edge";
import { handle, unauthorized, notFound } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { findLocation } from "@/lib/find";

export const GET = handle(async (req, { params }) => {
  await connectDB();
  const { id } = await params;
  const data = await findLocation(id);
  if (!data) return notFound();
  const children = await Location.find({ parent: data._id }).sort({ name: 1 }).lean();
  return Response.json({ data, children });
});

export const PUT = handle(async (req, { params }) => {
  if (!requireAdmin(req)) return unauthorized();
  await connectDB();
  const { id } = await params;
  const data = await Location.findByIdAndUpdate(id, await req.json(), { new: true, runValidators: true });
  if (!data) return notFound();
  return Response.json({ data });
});

export const DELETE = handle(async (req, { params }) => {
  if (!requireAdmin(req)) return unauthorized();
  await connectDB();
  const { id } = await params;
  const data = await Location.findByIdAndDelete(id);
  if (!data) return notFound();
  await Edge.deleteMany({ $or: [{ from: id }, { to: id }] });
  await Location.updateMany({ parent: id }, { parent: null });
  return Response.json({ success: true });
});