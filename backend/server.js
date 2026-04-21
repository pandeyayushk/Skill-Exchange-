require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 CONNECT DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ================= AUTH =================

// 🔐 SIGNUP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // ✅ SRM EMAIL ONLY
    if (!email.endsWith("@srmist.edu.in")) {
      return res.status(400).send("Only SRM emails allowed");
    }

    // ✅ CHECK IF USER EXISTS
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.send("User registered successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

// 🔐 LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ SRM EMAIL CHECK
    if (!email.endsWith("@srmist.edu.in")) {
      return res.status(400).send("Invalid domain");
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Wrong password");

    const token = jwt.sign({ id: user._id }, "secret123");

    // ❌ DO NOT SEND PASSWORD
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

// ================= USER ROUTES =================

// ADD USER
app.post("/add-user", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("User saved");
  } catch (err) {
    res.status(500).send(err);
  }
});

// GET USERS
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// UPDATE
app.put("/update-user/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.send("Updated");
});

// DELETE
app.delete("/delete-user/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});

// ================= SERVER =================

app.listen(5000, () => {
  console.log("Server running on port 5000");
});