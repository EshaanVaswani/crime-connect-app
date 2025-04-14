import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(
   cors({
      origin: "*",
      credentials: true,
   })
);
app.use(cookieParser());
app.use(express.json());

// Routes
import authRoutes from "./routes/auth.routes.js";
import emergencyContactRoutes from "./routes/emergency-contact.routes.js";
import reportRoutes from "./routes/reports.routes.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/emergency-contact", emergencyContactRoutes);
app.use("/api/v1/reports", reportRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
