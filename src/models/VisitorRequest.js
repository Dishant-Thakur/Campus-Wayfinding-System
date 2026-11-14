import mongoose from "mongoose";

const VisitorRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    type: { type: String, enum: ["help", "issue", "assistance"], default: "help" },
    message: { type: String, required: true, maxlength: 1000 },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", default: null },
    status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
    adminNote: String,
  },
  { timestamps: true }
);

export default mongoose.models.VisitorRequest || mongoose.model("VisitorRequest", VisitorRequestSchema);