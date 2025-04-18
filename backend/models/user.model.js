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

UserSchema.methods.toJSON = function () {
   const user = this.toObject();
   delete user.password;
   delete user.__v;
   delete user.updatedAt;
   return user;
 };

export default mongoose.model("User", UserSchema);
