import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
export const sendEmail = async (to, messageContent) => {
  try {
    //create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    //message obj
    const message = {
      to: to,
      subject: "Verify your account",
      html: `
            <h3>Message from Blog App to verify your Account</h3>
            <p>${messageContent}</p>
            `,
    };
    //send the email
    const info = await transporter.sendMail(message);
    console.log("Message sent");
    console.log(info)
  } catch (error) {
    console.log(error);
    throw new Error("Email could not be sent");
  }
};


