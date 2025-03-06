const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  messageType: {
    type: String,
    enum: ["enquiry", "testimonial", ] // Prevents very short names
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
  fullname: {
    type: String,
    trim: true,
    required: true
  },
  message: {
    type: String
  }
});

module.exports = mongoose.model("Message", messageSchema);
