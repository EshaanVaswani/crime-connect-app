import express from "express";

const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import {
   createReport,
   getReports,
   getReportsInRadius,
   getUserReports,
} from "../controllers/report.controller.js";
import { upload } from "../middleware/upload.middleware.js";

router
   .route("/")
   .post(protect, upload.array("media", 5), createReport)
   .get(getReports);

router.route("/radius/:lat/:lng/:distance").get(getReportsInRadius);
router.route("/user").get(protect, getUserReports);

router.get("/test", (req, res) => {
   console.log("Test endpoint hit:", req.body);
   res.json({ success: true, message: "API connection working!" });
});

export default router;
