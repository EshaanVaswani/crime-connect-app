import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
   {
      incidentType: {
         type: String,
         enum: [
            "theft",
            "assault",
            "vandalism",
            "burglary",
            "other",
            "missing",
         ],
         required: true,
      },
      dateTime: {
         type: Date,
         default: Date.now(),
      },
      location: {
         type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point",
         },
         coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            validate: {
               validator: function (value) {
                  return (
                     value.length === 2 &&
                     value[0] >= -180 &&
                     value[0] <= 180 && // lng
                     value[1] >= -90 &&
                     value[1] <= 90
                  ); // lat
               },
               message: "Coordinates must be [longitude, latitude]",
            },
         },
         address: {
            type: String,
            required: true,
            minlength: 10,
         },
      },
      title: {
         type: String,
         required: true,
         trim: true,
         maxlength: 50,
      },
      description: {
         type: String,
         required: true,
         maxlength: 500,
      },
      media: {
         type: [String],
         validate: [arrayLimit, "Media exceeds 5 items"],
         default: [],
      },
      suspectDescription: {
         type: String,
         maxlength: 200,
      },
      witnessDetails: {
         type: String,
         maxlength: 200,
      },
      anonymous: {
         type: Boolean,
         default: false,
      },
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
      },
      status: {
         type: String,
         enum: ["pending", "under_investigation", "resolved"],
         default: "pending",
      },
   },
   { timestamps: true }
);

// Validate media array length
function arrayLimit(val) {
   return val.length <= 5;
}

ReportSchema.index({ location: "2dsphere" });

export default mongoose.model("Report", ReportSchema);
