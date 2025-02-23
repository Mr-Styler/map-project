const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true, // Ensures every student has a name
    trim: true,
    minlength: 2, // Prevents very short names
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Invalid email format",
    },
  },
  role: {
    type: String,
    default: "studnet",
    enum: ["student", "instructor", "admin"]
  },
},
{ discriminatorKey: "role", timestamps: true })

const User = mongoose.model("User", userSchema);
module.exports = User