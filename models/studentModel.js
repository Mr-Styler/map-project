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
  salary: {
    type: Number,
    min: 0, // Prevents negative salaries
    default: 0, // Default salary is 0
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
