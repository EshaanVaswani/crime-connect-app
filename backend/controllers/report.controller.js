import Report from "../models/report.model.js";
import asyncHandler from "../utils/async.js";

// @desc    Create new report
// @route   POST /api/v1/reports
export const createReport = asyncHandler(async (req, res, next) => {
   // Add user to req.body
   req.body.user = req.user.id;

   const report = await Report.create(req.body);

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
