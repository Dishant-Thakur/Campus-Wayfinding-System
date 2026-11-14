import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    code: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, enum: ["gate", "block", "room", "landmark", "facility"], required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Location", default: null },
    floor: Number,
    lat: Number,
    lng: Number,
    description: String,
    keywords: [String],
    accessible: { type: Boolean, default: true },
    qrCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.models.Location || mongoose.model("Location", LocationSchema);