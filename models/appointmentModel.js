const mongoose = require("mongoose");

const timeslots = [9, 10, 11, 12, 13, 14, 15, 16]

const appointmentSchema = new mongoose.Schema({
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
  instructor: {
    type: mongoose.Types.ObjectId,
    ref: "Instructor"
  },
  time: {
    type: Date,
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "completed", "approved"]
  }
});

appointmentSchema.pre("save", function (next) {
    if (this.isNew) {
        // query to get the furthest booked date
    }

    next()
})

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment
