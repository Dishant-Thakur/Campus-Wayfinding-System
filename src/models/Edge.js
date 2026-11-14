import mongoose from "mongoose";

const EdgeSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    distance: { type: Number, required: true, min: 1 },
    accessible: { type: Boolean, default: true },
    instruction: String,
  },
  { timestamps: true }
);

export default mongoose.models.Edge || mongoose.model("Edge", EdgeSchema);