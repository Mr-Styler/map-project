const mongoose = require("mongoose");
const User = require("./userModel");

const instructorSchema = new mongoose.Schema({
    timeSlots: [{
      day: {
        type: Number,
        required: true
      },
      time: {
        type: String,
        required: true,
        validate: {
          validator: function (value) {
            return /^(?:[01]\d|2[0-3]):00$/.test(value);
          },
          message: props => `${props.value} is not a valid time format. Use "HH:00" where HH is between 00 and 23.`
        }
      }
    }]
  });



const Instructor = User.discriminator("instructor", instructorSchema)
module.exports = Instructor