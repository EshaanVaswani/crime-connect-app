import mongoose from "mongoose";

const EmergencyContactSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      name: {
         type: String,
         required: true,
         trim: true,
      },
      phone: {
         type: String,
         required: true,
         match: /^(\+?\d{1,3}[- ]?)?\d{10}$/,
      },
      relationship: {
         type: String,
         enum: ["family", "friend", "neighbor", "other"],
         default: "other",
      },
   },
   { timestamps: true }
);

export default mongoose.model("EmergencyContact", EmergencyContactSchema);
