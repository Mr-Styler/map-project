const mongoose = require("mongoose");
const User = require("./userModel");

const studentSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: true,
  },
  occupation: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
  },
  degree: {
    type: String
  },
  attendanceCheck: [
    {
      date: {
        type: Date,
        default: Date.now, // Stores attendance timestamp
      },
      status: {
        type: String,
        enum: ["present", "absent", "late"], // Limits to specific attendance types
        required: true,
      },
    },
  ],
});

const Student = User.discriminator("student", studentSchema);
module.exports = Student;
