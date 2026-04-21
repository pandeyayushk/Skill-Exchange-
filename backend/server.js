require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 CONNECT TO MONGODB (SAFE)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// test route
app.get("/", (req, res) => {
  res.send("API running");
});

// ================== ROUTES (NEXT STEP READY) ==================

// TEMP test route
app.get("/users", (req, res) => {
  res.send("Users route working");
});

// =============================================================

// start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});