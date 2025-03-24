const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const BASE_URL =
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

const config = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PWD,
  },
};

const transporter = nodemailer.createTransport(config);

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mind Accelerator Program",
    link: BASE_URL,
  },
});

exports.verifyEmail = (email, username) => {
  let response = {
    body: {
      greeting: `Hello ${username}`,
      intro: [
        "Thank you for registering for our MAP classes!",
        "Your journey to Mental freedom is abou to start!",
        "Our team is excited to have you join our program",
        "But before you can start please verify your regsitration by reading our terms and conditions"
      ],
      action: {
        instructions: "Click to verify your registration",
        button: {
          color: "#22BC66",
          text: "Verify",
          link: `${BASE_URL}/terms-and-conditions?email=${email}`,
        },
      },
      outro: [
        `If you have any questions or need assistance at any point, our support team is ready to help. You can reach out to us via the "Contact Us" section on the website, or simply shoot us an email at mapwebinar@gmail.com`,
        `Thank you again for choosing MAP. We look forward to accompanying you on your journey to financial empowerment.`,
      ],
      signature: "Best regards",
      copyright: `Copyright ${new Date().getFullYear()} MAP. All rights reserved.`,
    },
  };

  let mail = mailGenerator.generate(response);

  let msg = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your MAP Admission",
    html: mail,
  };

  return transporter.sendMail(msg);
};

exports.messageEmail = (email, username, message) => {
  let response = {
    body: {
      greeting: `New Enquiry`,
      intro: [
        `name: ${username}`,
        `email: ${email}`,
        `message: ${message}`
      ],
      signature: "Best regards",
      copyright: `Copyright ${new Date().getFullYear()} MAP. All rights reserved.`,
    },
  };

  let mail = mailGenerator.generate(response);

  let msg = {
    from: process.env.EMAIL_USER,
    to: "mapwebinar@gmail.com",
    subject: "New Message",
    html: mail,
  };

  return transporter.sendMail(msg);
};
exports.welcomeEmail = (email, username) => {
  let response = {
    body: {
      greeting: `Hello ${username}`,
      intro: [
        "Thank you for joining MAP!",
        "Your journey to Mental freedom begins here!",
        "Our team is excited to have you join our program",
        "We believe this program we shape you into taking the rights decisions to mental and financial freedom.",
        `We're all about helping you grow as a person.`,
      ],
      outro: [
        `If you have any questions or need assistance at any point, our support team is ready to help. You can reach out to us via the "Contact Us" section on the website, or simply shoot us an email at mapwebinar@gmail.com`,
        `Thank you again for choosing MAP. We look forward to accompanying you on your journey to financial empowerment.`,
      ],
      signature: "Best regards",
      copyright: `Copyright ${new Date().getFullYear()} MAP. All rights reserved.`,
    },
  };

  let mail = mailGenerator.generate(response);

  let msg = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to the Mind Acceletrator Program",
    html: mail,
  };

  return transporter.sendMail(msg);
};

exports.reminderEmail = (email, username) => {
  const telegramLink = "https://t.me/+MSJ9qQV0i485MjQ8"
  const facebookLink = "https://www.facebook.com/share/1EQ1hWkimG/?mibextid=wwXIfr"
  let response = {
    body: {
      greeting: `Dear ${username},`,
      intro: [
        "This is a reminder that your Mind Accelerator Program starts tomorrow, 25/03/2025! 🎉",
        "We’re excited to have you on board as we embark on this transformational journey together.",
        "If you’ve verified your application, congratulations! You’re officially a successful participant.",
        "However, if you haven’t verified yet, please complete your verification using the link below."
      ],
      action: {
        instructions: "Click below to complete your verification:",
        button: {
          color: "#22BC66",
          text: "Complete Your Verification",
          link: `${BASE_URL}/terms-and-conditions?email=${email}`
        }
      },
      outro: [
        `📌 <strong>Join our Classroom on Telegram:</strong> <a href="${telegramLink}" target="_blank">MAP Webinar Live Class</a>`,
        `📌 <strong>Join our Community on Facebook:</strong> <a href="${facebookLink}" target="_blank">Click here</a>`,
        "",
        "🕗 <strong>Here are your class details:</strong>",
        "📌 <strong>Date:</strong> Tuesday, 25th March, 2025",
        "📌 <strong>Time:</strong> 8PM West African Time (WAT)",
        "",
        "Let’s get ready for a purposeful, intentional, and fulfilling journey! 🚀"
      ],
      signature: "Best regards,",
      copyright: `Copyright ${new Date().getFullYear()} MAP. All rights reserved.`,
    },
  };

  let mail = mailGenerator.generate(response);

  let msg = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "REMINDER!!! Your Mind Accelerator Program Starts Tomorrow at 8PM",
    html: mail,
  };

  return transporter.sendMail(msg);
};


exports.classReminder = (email, username, year, batch, date) => {
  let response = {
    body: {
      name: `${username},`,
      intro: "We’re excited to remind you about an upcoming class!",
      table: {
        data: [
          { Item: "📅 Event:", Details: `MAP ${year} Batch ${batch}` },
          {
            Item: "🗓 Date:",
            Details: new Date(date).toLocaleString("en-US", {
              weekday: "long", // Full day name (e.g., Monday)
              month: "long", // Full month name (e.g., February)
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true, // AM/PM format
            }),
          },
          { Item: "📍 Location:", Details: "https://t.me/+MSJ9qQV0i485MjQ8" },
        ],
      },
      action: {
        instructions: "Click below to view more details:",
        button: {
          color: "#22BC66",
          text: "View Event Details",
          link: "https://t.me/+MSJ9qQV0i485MjQ8",
        },
      },
      outro:
        "If you have any questions, feel free to reach out. Looking forward to seeing you there!",
      signature: "Best regards",
      copyright: `Copyright ${new Date().getFullYear()} MAP. All rights reserved.`,
    },
  };

  let mail = mailGenerator.generate(response);

  let msg = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "MAP google meet invite",
    html: mail,
  };

  return transporter.sendMail(msg);
};

exports.studentAppointmnent = (
  email,
  username,
  coachName,
  sessionDate,
  sessionTime,
  meetingLink
) => {
  let response = {
    body: {
      name: username,
      intro: `Your session with **Coach ${coachName}** has been successfully booked!`,
      table: {
        data: [
          { Item: "📅 Date:", Details: sessionDate },
          { Item: "⏰ Time:", Details: sessionTime },
          { Item: "🧑‍🏫 Instructor:", Details: coachName },
          {
            Item: "🔗 Meeting Link:",
            Details: `<a href="${meetingLink}">${meetingLink}</a>`,
          },
        ],
      },
      action: {
        instructions:
          "Click the button below to join your session at the scheduled time:",
        button: {
          color: "#22BC66",
          text: "Join Session",
          link: meetingLink,
        },
      },
      outro:
        "If you have any questions, feel free to contact us. Looking forward to your session!",
    },
  };

  let mail = mailGenerator.generate(response);

  let msg = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to the Mind Acceletrator Program",
    html: mail,
  };

  return transporter.sendMail(msg);
};
