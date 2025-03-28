require("dotenv").config({ path: "./config.env" });
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const axios = require("axios");
const crypto = require("crypto")
const User = require("./models/userModel");
const { welcomeEmail, classReminder, verifyEmail, messageEmail, reminderEmail } = require("./utils/email");
const Appointment = require("./models/appointmentModel");
const Batch = require("./models/batchModel");
const Transaction = require("./models/transactionModel");
const Student = require("./models/studentModel");
const Message = require("./models/messageModel");
const { setTimeout } = require("timers");
const app = express();

const DB_URI = process.env.DB_URI || "mongodb://localhost/MAP-db";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Set the view engine to ejs
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(morgan("dev"));

// Set the directory for your EJS templates
app.set("views", "views");

app.post("/google-form-webhook", async (req, res) => {
  req.body = { ...req.body, role: "student" };
  const student = await Student.create(req.body);

  await verifyEmail(student.email, student.fullname);

  res.status(201).json({
    status: "success",
    message: "Student registration successful",
    data: student,
  });
});

app.get("/", (req, res) => {
  res.render("index", { name: "Alice", age: 30 });
});

app.post("/pay", async (req, res) => {
  const { email } = req.body;
  const amount = 500;

  try {
    const student = await User.findOne({ email });

    // if (!student) {
    //   return res.status(404).json({
    //     message: "This email was not registered for our program",
    //   });
    // }

    // Create payment link
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Paystack accepts amounts in kobo
        callback_url: "http://localhost:3000/payment/callback",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response;

    if (data.status) {
      const { reference, authorization_url } = data.data;
      const transaction = await Transaction.create({
        reference,
        email,
        amount,
      });

      res.json({
        message: "Payment link generated successfully",
        authorization_url,
        reference,
      });
    } else {
      res.status(500).json({
        message: "Payment link generation failed",
        error: data.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error while initiating payment",
      error: error.message,
    });
  }
});

app.get("/payment/callback", async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.render("payment", {
      status: "error",
      message: "Missing payment reference",
    });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const data = response.data;

    if (data.status && data.data.status === "success") {
      await Transaction.findOneAndUpdate(
        { reference },
        { status: "success" },
        { new: true }
      );

      return res.render("payment", {
        status: "success",
        message: "Payment successful!",
        amount: data.data.amount / 100, // Convert from kobo to naira
        reference,
      });
    } else {
      return res.render("payment", {
        status: "failed",
        message: "Payment failed. Please try again.",
        reference,
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error.message);
    return res.render("payment", {
      status: "error",
      message: "An error occurred while verifying payment.",
      reference,
    });
  }
});

app.post("/withdraw", async (req, res) => {
  const { amount } = req.body;

  try {
    // Create a transfer request
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: "balance", // You can use 'balance' or 'subaccount'
        amount: 500 * 100, // Amount in kobo
        recipient: "RCP_ge010zc4cfe1wh8",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response;

    if (data.status) {
      res.json({
        message: "Withdrawal request initiated successfully",
        transfer_data: data.data,
      });
    } else {
      res
        .status(500)
        .json({ message: "Withdrawal failed", error: data.message });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during withdrawal", error: error.message });
  }
});

app.get("/certificate", (req, res) => {
  res.render("certificate");
});

app.get("/terms-and-conditions", (req, res) => {
  res.render("T&Cs");
});

app.get("/attendance/:dateHash", (req, res) => {
  res.render("attendance");
});

app.post("/api/v1/verify", async (req, res) => {
  try {
    const {email} = req.body

    if (!email) {
      return res.status(400).json({
        message: "Please use the link sent to your email to verify your admission"
      })
    }

    const student = await Student.findOneAndUpdate({email}, {
      active: true
    }, {
      runValidators: true,
      new: true
    })

    await welcomeEmail(student.email, student.fullname);

    res.status(200).json({message: "Congratulations your now part of the program"})
  } catch (err) {
    res.status(400).json({
      message: "Sorry, something went wrong"
    })
  }
  
})

// BATCH ENDPOINTS
app.post("/api/v1/batches", async (req, res) => {
  const newBatch = await Batch.create(req.body);

  const students = await User.find({ active: true });

  students.forEach(async (student) => {
    newBatch.participants.push({ participant: student._id, score: 0 });
    await classReminder(
      student.email,
      student.fullname,
      newBatch.year,
      newBatch.name,
      newBatch.startDate
    );
  });

  await newBatch.save()

  res.status(201).json({
    status: "success",
    message: "new batch added",
    data: newBatch,
  });
});

app.get("/api/v1/batches", async (req, res) => {
  const batches = await Batch.find(req.query);

  res.status(200).json({
    status: "success",
    message: "batches retrieved",
    data: batches,
  });
});

app.get("/api/v1/batches/:id", async (req, res) => {
  const batches = await Batch.findById(req.params.id);

  res.status(200).json({
    status: "success",
    message: "batch retrieved",
    data: batches,
  });
});

app.patch("/api/v1/batches/:id", async (req, res) => {
  const batches = await Batch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "batch updated",
    data: batches,
  });
});

app.delete("/api/v1/batches/:id", async (req, res) => {
  const batches = await Batch.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    message: "batch deleted",
  });
});

// USERS ENDPOINTS
app.post("/api/v1/users", async (req, res) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    message: "new registration successful",
    data: newUser,
  });
});

app.get("/api/v1/users", async (req, res) => {
  const users = await User.find(req.query);

  res.status(200).json({
    status: "success",
    message: "users retrieved",
    data: users,
  });
});

app.get("/api/v1/users/:id", async (req, res) => {
  const users = await User.findById(req.params.id);

  res.status(200).json({
    status: "success",
    message: "user retrieved",
    data: users,
  });
});

app.patch("/api/v1/users/:id", async (req, res) => {
  const users = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "user updated",
    data: users,
  });
});

app.delete("/api/v1/users/:id", async (req, res) => {
  const users = await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    message: "user deleted",
  });
});

app.post("/api/v1/message", async (req, res) => {
  req.body = { ...req.body, messageType: "enquiry" };
  const message = await Message.create(req.body);

  await messageEmail(message.email, message.fullname, message.message);

  res.status(201).json({
    status: "success",
    message: "message sent"
  });
});

app.post("/api/v1/students", async (req, res) => {
  req.body = { ...req.body, role: "student" };
  const student = await Student.create(req.body);

  await verifyEmail(student.email, student.fullname);

  res.status(201).json({
    status: "success",
    message: "Student registration successful",
    data: student,
  });
});

app.post("/api/v1/instructor/book", async (req, res) => {
  try {
    const { fullname, email } = req.body;
    const now = new Date();
    const instructors = await User.find({ role: "instructor" });

    let earliestInstructor = null;
    let earliestTime = null;

    for (const instructor of instructors) {
      for (const timeslot of instructor.timeslots) {
        const slotDate = new Date(now);
        slotDate.setDate(
          now.getDate() + ((timeslot.day + 7 - now.getDay()) % 7)
        ); // Adjust for correct weekday
        slotDate.setHours(parseInt(timeslot.time.split(":")[0]), 0, 0, 0); // Set to exact hour

        if (slotDate > now) {
          // Ensure future slot
          const isAlreadyBooked = await Appointment.exists({
            instructor: instructor._id,
            time: slotDate,
          });

          if (!isAlreadyBooked && (!earliestTime || slotDate < earliestTime)) {
            earliestTime = slotDate;
            earliestInstructor = instructor;
          }
        }
      }
    }

    if (!earliestInstructor) {
      return res.status(400).json({
        status: "fail",
        message: "No available instructors for booking at this time.",
      });
    }

    // Create a new appointment
    const newBooking = await Appointment.create({
      fullname,
      email,
      instructor: earliestInstructor._id,
      time: earliestTime,
      status: "confirmed",
    });

    res.status(201).json({
      status: "success",
      message: "Appointment booked successfully.",
      data: {
        appointmentId: newBooking._id,
        instructorId: earliestInstructor._id,
        instructorName: earliestInstructor.name,
        time: earliestTime,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

app.post("/api/v1/reminder", async (req, res) => {
  const students = await Student.find()

  students.forEach( student => {
    setTimeout(async() => {
      await reminderEmail(student.email, student.fullname)
      console.log(student.email, student.fullname)
    }, 10000);
  })

  res.status(200).json({
    message: "All students successfully in formed"
  })
})


app.post("/api/v1/attendance", async (req, res) => {
  try {
    const { date } = req.body; // Extract date from request body

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Create a hash using the provided date
    const dateHash = crypto.createHash("sha256").update(date).digest("hex");

    res.status(200).json({
      message: "Attendance link created",
      data: {
        link: `${req.protocol}://${req.get("host")}/attendance/${dateHash}`,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/v1/attendance/check", async (req, res) => {
  try {
    const { email, dateHash } = req.body; // Extract date from request body

    const newDate = new Date(); // Example date
    const formattedDate = newDate.toISOString().split("T")[0];
    const isMatch = crypto.createHash("sha256").update(formattedDate).digest("hex") === dateHash;

    if (!isMatch) {
      return res.status(400).json({ message: "You're too late to check 'present' for attendance" });
    }

    const student = await Student.findOneAndUpdate({email}, {$push: {attendanceCheck: {date: new Date(formattedDate), status: "present" }}}, {
      runValidators: true,
      new: true
    })

    console.log(student.attendanceCheck)

    res.status(200).json({
      message: "Attendance link created",
      data: {
        link: `${req.protocol}://${req.get("host")}/attendance/${dateHash}`,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => console.log(err));

// const verificationCorrection =async () => {
//   const registeredStudnets = await Student.find({active: true})

//   registeredStudnets.forEach(async student => {
//     student.active = false

//     await student.save()
//     await verifyEmail(student.email, student.fullname)
//     console.log("done")
//   })
// }

// verificationCorrection()

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
