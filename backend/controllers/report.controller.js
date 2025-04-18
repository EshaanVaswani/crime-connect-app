import Report from "../models/report.model.js";
import asyncHandler from "../utils/async.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import fs from "fs";

// @desc    Create new report
// @route   POST /api/v1/reports
export const createReport = asyncHandler(async (req, res, next) => {
   console.log("Full request:", {
      body: req.body,
      files: req.files,
      headers: req.headers,
   });

   console.log("Cloudinary Config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY?.slice(0, 4) + "...", // Partial reveal
      api_secret: process.env.CLOUDINARY_API_SECRET?.slice(0, 4) + "...",
   });

   // Add user to req.body
   req.body.user = req.user.id;

   // Process media files
   const mediaUrls = [];
   // In your createReport controller
   if (req.files && req.files.length > 0) {
      for (const file of req.files) {
         try {
            // Add file verification
            console.log("File metadata:", {
               size: file.size,
               mimetype: file.mimetype,
               path: file.path,
               exists: fs.existsSync(file.path),
            });

            const cloudinaryResponse = await uploadOnCloudinary(file.path);

            if (!cloudinaryResponse) {
               console.error(
                  "Null response from Cloudinary for file:",
                  file.originalname
               );
               continue;
            }

            mediaUrls.push(cloudinaryResponse.secure_url);
         } catch (error) {
            console.error("File processing failed:", {
               file: file.originalname,
               error: error.message,
            });
         }
      }
   }
   // Parse location data safely
   let locationData;
   try {
      // Handle different ways location might be sent
      if (typeof req.body.location === "string") {
         locationData = JSON.parse(req.body.location);
      } else if (req.body.location && typeof req.body.location === "object") {
         locationData = req.body.location;
      } else {
         locationData = { address: "Unknown location" };
      }
   } catch (error) {
      console.error("Error parsing location:", error);
      locationData = { address: "Error parsing location" };
   }

   // Create the location object in proper format for MongoDB
   const location = {
      type: "Point",
      coordinates: [
         parseFloat(locationData.lng || 0),
         parseFloat(locationData.lat || 0),
      ],
      address: locationData.address || "Unknown address",
   };

   // Create report with correctly processed data
   const reportData = {
      incidentType: req.body.incidentType,
      dateTime: new Date(req.body.dateTime),
      description: req.body.description,
      anonymous: req.body.anonymous === "true",
      user: req.body.user,
      media: mediaUrls,
      location: location,
   };

   console.log("Processed report data:", reportData);

   const report = await Report.create(reportData);

   if (!report) {
      return next(new Error("Report creation failed"));
   }

   res.status(201).json({
      success: true,
      data: report,
   });
});

// @desc    Get all reports
// @route   GET /api/v1/reports
export const getReports = asyncHandler(async (req, res, next) => {
   const reports = await Report.find().populate("user", "phone createdAt");

   res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
   });
});

// @desc    Get reports within radius
// @route   GET /api/v1/reports/radius/:lat/:lng/:distance
export const getReportsInRadius = asyncHandler(async (req, res, next) => {
   const { lat, lng, distance } = req.params;

   const radius = distance / 6378.1; // Earth radius in km

   const reports = await Report.find({
      location: {
         $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
   });

   res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
   });
});

export const getUserReports = asyncHandler(async (req, res, next) => {
   const reports = await Report.find({ user: req.user.id })
     .select("type createdAt status _id description")
     .sort("-createdAt");
 
   res.status(200).json({
     success: true,
     count: reports.length,
     data: reports,
   });
 });
