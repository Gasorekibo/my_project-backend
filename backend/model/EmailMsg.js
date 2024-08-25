import mongoose, { mongo } from "mongoose";

const emailMsgSchema = new mongoose.Schema(
  {
    fromEmail: {
      type: String,
      required: [true, "Receiver Email is required"],
    },
    toEmail: {
      type: String,
      required: [true, "Sender Email is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const EmailMsg = mongoose.model("EmailMsg", emailMsgSchema);

export default EmailMsg;
