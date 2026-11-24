import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },
    company: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },
    industry: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    projectType: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    timeline: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },
    budget: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },
    preferredContactMethod: {
      type: String,
      enum: ["", "Email", "Phone Call", "WhatsApp"],
      default: "",
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;