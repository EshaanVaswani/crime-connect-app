import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

// Connect to database
connectDB();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // allow your frontend
    credentials: true, // allow cookies or headers if you use them
  })
);
// Middleware
// In your server.js or app.js
app.use(
<<<<<<< Updated upstream
<<<<<<< Updated upstream
   cors({
      origin: ["exp://192.168.1.102:8081", "http://localhost:5173"],
      credentials: true,
   })
=======
=======
>>>>>>> Stashed changes
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || "Server Error",
  });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
    message: "Server is running",
  });
<<<<<<< Updated upstream
});

const server = http.createServer(app);

export const io = new Server(server, {
   cors: {
      origin: ["exp://192.168.1.102:8081", "http://localhost:5173"],
      methods: ["GET", "POST"],
   },
});

io.policeDashboards = new Set();

io.on("connection", (socket) => {
   console.log("Police dashboard connected:", socket.id);
   io.policeDashboards.add(socket.id);

   socket.on("disconnect", () => {
      console.log("Police dashboard disconnected:", socket.id);
      io.policeDashboards.delete(socket.id);
   });
=======
>>>>>>> Stashed changes
});

const PORT = process.env.PORT || 3000;

<<<<<<< Updated upstream
<<<<<<< Updated upstream
server.listen(PORT, "0.0.0.0", () =>
   console.log(`Server running on port ${PORT}`)
=======
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
>>>>>>> Stashed changes
=======
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
>>>>>>> Stashed changes
);
