require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);

// Fail fast if DB is down (avoid request buffering timeouts)
// We'll start listening only after DB is connected.
mongoose.set("bufferCommands", false);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // Will restrict this in production
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors());
app.use(express.json());

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." }
});
app.use("/api/auth", authLimiter);

// 🔥 CONNECT DB
const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/skill-exchange";
const PRIMARY_MONGO_URI = process.env.MONGO_URI || LOCAL_MONGO_URI;

async function connectMongoWithFallback() {
  const tryConnect = async (uri, label) => {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log(`MongoDB connected (${label})`);
      return true;
    } catch (err) {
      console.error(`MongoDB connection error (${label}):`, err?.message || err);
      return false;
    }
  };

  const primaryOk = await tryConnect(PRIMARY_MONGO_URI, process.env.MONGO_URI ? "MONGO_URI" : "local");
  if (primaryOk) return;

  if (process.env.MONGO_URI) {
    console.error("Falling back to local MongoDB. Start MongoDB at 127.0.0.1:27017 to use the app.");
    await tryConnect(LOCAL_MONGO_URI, "local fallback");
  }
}

// We'll connect before accepting requests.

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// ================= SOCKET.IO =================
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));
  
  // Must match authController's signing secret fallback
  jwt.verify(token, process.env.JWT_SECRET || "secret123", (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = decoded.id;
    next();
  });
});

const userSockets = new Map(); // Maps userId to socketId

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);
  userSockets.set(socket.userId, socket.id);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
    userSockets.delete(socket.userId);
  });
});

// Make io accessible in controllers
app.set("io", io);
app.set("userSockets", userSockets);

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

async function start() {
  await connectMongoWithFallback();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Fatal startup error:", err?.message || err);
  process.exit(1);
});

// Friendlier startup errors (e.g., port already in use)
server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
    console.error("Close the process using it, or set a different PORT and retry.");
    console.error("Example (PowerShell): $env:PORT=5001; node server.js");
    process.exit(1);
  }
});