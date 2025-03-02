const mongoose = require("mongoose");
const currentYear = new Date().getFullYear(); // Get the current year dynamically
const yearRegex = new RegExp(`^(${currentYear}|${currentYear + 1}|${currentYear + 2}|\\d{4})$`); 


const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    uppercase: true,
    required: true,
    maxLength: 1,
    minLength: 1
  },
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open"
  },
  closeDate: {
    type: Date
  },
  startDate: {
    type: Date,
    required: true,
  },
  year: {
    type: String,
    match: yearRegex
  },
  participants: [
    {
      score: {
        type: Number,
      },
      participant: {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

const Batch = mongoose.model("Batch", batchSchema);
module.exports = Batch;
