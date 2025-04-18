import express from "express";
import { getMe, login, verifyOTP } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/verify", verifyOTP);
router.get("/me", protect, getMe);

export default router;
