import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
   {
      phone: {
         type: String,
         required: true,
         unique: true,
         match: /^(\+?\d{1,3}[- ]?)?\d{10}$/,
      },
      emergencyContacts: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EmergencyContact",
         },
      ],
   },
   { timestamps: true }
);

export default mongoose.model("User", UserSchema);
