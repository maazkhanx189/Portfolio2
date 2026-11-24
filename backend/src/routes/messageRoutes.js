
import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import protect from "../middleware/auth.js";
import { sendContactEmail } from "../utils/mailer.js";

const router = express.Router();

// Public: contact form / project brief submission
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
      projectBrief,
      phone,
      company,
      industry,
      projectType,
      timeline,
      budget,
      preferredContactMethod,
    } = req.body;

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanMessage = String(message || projectBrief || "").trim();

    const cleanSubject = String(
      subject || projectType || "General Inquiry"
    ).trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Name, email and project/message details are required.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const allowedContactMethods = ["", "Email", "Phone Call", "WhatsApp"];
    const cleanContactMethod = String(
      preferredContactMethod || ""
    ).trim();

    if (!allowedContactMethods.includes(cleanContactMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid preferred contact method.",
      });
    }

    // Save inquiry in MongoDB first
    const newMessage = await Message.create({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      phone: String(phone || "").trim(),
      company: String(company || "").trim(),
      industry: String(industry || "").trim(),
      projectType: String(projectType || "").trim(),
      timeline: String(timeline || "").trim(),
      budget: String(budget || "").trim(),
      preferredContactMethod: cleanContactMethod,
    });

    // Send Gmail notification when Email is selected
    if (cleanContactMethod === "Email") {
      try {
        await sendContactEmail({
          name: cleanName,
          email: cleanEmail,
          phone,
          company,
          industry,
          projectType,
          timeline,
          budget,
          preferredContactMethod: cleanContactMethod,
          subject: cleanSubject,
          message: cleanMessage,
        });

        console.log("Contact email successfully sent.");

        return res.status(201).json({
          success: true,
          emailSent: true,
          message: "Your inquiry has been received and email notification sent.",
          data: {
            id: newMessage._id,
          },
        });
      } catch (emailError) {
        console.error("GMAIL SEND ERROR:", emailError);

        return res.status(201).json({
          success: true,
          emailSent: false,
          message:
            "Your inquiry was saved, but the email notification could not be sent. Please contact us directly.",
          data: {
            id: newMessage._id,
          },
        });
      }
    }

    // Generate WhatsApp link when WhatsApp is selected
    if (cleanContactMethod === "WhatsApp") {
      const whatsappNumber = String(
        process.env.WHATSAPP_NUMBER || ""
      ).replace(/\D/g, "");

      if (!whatsappNumber) {
        console.error("WHATSAPP_NUMBER is missing from backend .env");
        
        return res.status(201).json({
          success: true,
          message: "Your inquiry was saved, but WhatsApp is not configured.",
          data: {
            id: newMessage._id,
          },
        });
      }

      const whatsappMessage = [
        "Hello, I am contacting you through your portfolio.",
        "",
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Phone: ${phone || "Not provided"}`,
        `Company: ${company || "Not provided"}`,
        `Project: ${projectType || "Not provided"}`,
        `Timeline: ${timeline || "Not provided"}`,
        `Budget: ${budget || "Not provided"}`,
        "",
        `Message: ${cleanMessage}`,
      ].join("\n");

      const whatsappUrl =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      return res.status(201).json({
        success: true,
        message: "Your inquiry has been received. Continue to WhatsApp.",
        data: {
          id: newMessage._id,
          whatsappUrl,
        },
      });
    }

    // Phone Call or no preferred method
    return res.status(201).json({
      success: true,
      message: "Your message has been received successfully.",
      data: {
        id: newMessage._id,
      },
    });
  } catch (error) {
    console.error("Contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send your message.",
    });
  }
});

// Admin: all contact messages
router.get("/", protect, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Fetch messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch messages.",
    });
  }
});

// Admin: mark message as read
router.patch("/:id/read", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: "read" },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as read.",
      data: message,
    });
  } catch (error) {
    console.error("Update message error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update message.",
    });
  }
});

// Admin: delete message
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete message.",
    });
  }
});

export default router;
