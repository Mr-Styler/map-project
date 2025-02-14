const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const session = require("express-session");

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
    name: "Finaseed Limited",
    link: `https://localhost:${session.PORT}`,
  },
});

exports.welcomeEmail = (user) => {
  let response = {
    body: {
      intro: [
        "Hello there,",
        "Thank you for joining FinaSeed!",
        "Your journey to Financial freedom begins here!",
        "Our team is excited to help you navigate the world of finance, making it easier for you to manage your finances, pursue your dreams and secure a bright future.",
        "Here is a quick review of how you can make good use of our site.",
        'We offer a diverse range of investment options tailored to your financial goals and risk tolerance. Log in to your account, navigate to the "Invest" section, and explore the various investment avenues available. Feel free to explore the details, compare options, and make informed decisions.',
        `We're all about helping you grow your savings effortlessly. Head to the "Save" section to discover automated saving plans that align with your objectives.`,
        `We're committed to providing you with responsible borrowing options to meet your needs. In the "Loans" section, you can learn about our flexible loan offerings.`,
      ],
      outro: [
        `If you have any questions or need assistance at any point, our support team is ready to help. You can reach out to us via the "Contact Us" section within the app, or simply shoot us an email at support.finaseed8@gmail.com`,
        `Thank you again for choosing FinaSeed. We look forward to accompanying you on your journey to financial empowerment.`,
      ],
      signature: "Best regards",
      copyright: "Copyright 2023 Finaseed Ltd. All rights reserved.",
    },
  };

  let mail = mailGenerator.generate(response);

  let msg = {
    from: process.env.EMAIL_USER,
    to: user,
    subject: "Welcome to Finaseed Ltd",
    html: mail,
  };

  return transporter.sendMail(msg);
};
