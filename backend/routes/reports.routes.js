import express from "express";

const router = express.Router();
import { protect } from "../middleware/auth.middleware.js";
import {
   createReport,
   getReports,
   getReportsInRadius,
} from "../controllers/report.controller.js";

router.route("/").post(protect, createReport).get(getReports);

router.route("/radius/:lat/:lng/:distance").get(getReportsInRadius);

export default router;
