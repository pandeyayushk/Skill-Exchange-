const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  skillOffered: String,
  skillNeeded: String,
});

module.exports = mongoose.model("User", userSchema);