import mongoose from "mongoose";
import Location from "@/models/Location";

export const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function findLocation(q) {
  const s = String(q).trim();
  if (mongoose.isValidObjectId(s)) {
    const byId = await Location.findById(s).lean();
    if (byId) return byId;
  }
  const exact = await Location.findOne({
    $or: [{ code: s.toLowerCase() }, { qrCode: s }, { name: new RegExp(`^${esc(s)}$`, "i") }],
  }).lean();
  if (exact) return exact;
  return Location.findOne({ name: new RegExp(esc(s), "i") }).lean();
}