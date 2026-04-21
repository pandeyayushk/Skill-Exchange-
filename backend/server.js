require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 CONNECT TO MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// test route
app.get("/", (req, res) => {
  res.send("API running");
});

// ================== CRUD ROUTES ==================

// 🟢 CREATE
app.post("/add-user", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("User saved successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

// 🔵 READ
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send(err);
  }
});

// 🟡 UPDATE
app.put("/update-user/:id", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.send("User updated successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

// 🔴 DELETE
app.delete("/delete-user/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send("User deleted successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

// =================================================

app.listen(5000, () => {
  console.log("Server running on port 5000");
});