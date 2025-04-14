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
// In your server.js or app.js
app.use(
   cors({
      origin: [
         "http://localhost:8081",
         /\.exp\.direct$/, // Allow Expo direct URLs
         /\.exp\.googlesyndication\.com$/, // Android emulator
         "http://192.168.1.100:8081", // Add your Expo dev port
      ],
      credentials: true,
   })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
import authRoutes from "./routes/auth.routes.js";
import emergencyContactRoutes from "./routes/emergency-contact.routes.js";
import reportRoutes from "./routes/reports.routes.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/emergency-contact", emergencyContactRoutes);
app.use("/api/v1/reports", reportRoutes);

app.get('/api/v1/health', (req, res) => {
   res.status(200).json({ 
     status: 'ok',
     timestamp: new Date(),
     message: 'Server is running'
   });
 });

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () =>
   console.log(`Server accessible at http://192.168.1.100:${PORT}`)
);
