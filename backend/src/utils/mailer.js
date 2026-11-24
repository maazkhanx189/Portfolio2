
import nodemailer from "nodemailer";

export async function sendContactEmail({
  name,
  email,
  phone,
  company,
  industry,
  projectType,
  timeline,
  budget,
  preferredContactMethod,
  subject,
  message,
}) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    throw new Error("Gmail credentials are missing from backend .env");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
  });

  const receiver =
    process.env.CONTACT_RECEIVER_EMAIL || gmailUser;

  try {
    await transporter.verify();
    console.log("Gmail SMTP connection verified.");

    const info = await transporter.sendMail({
      from: `"Portfolio Contact Form" <${gmailUser}>`,
      to: receiver,
      replyTo: email,
      subject: `New Portfolio Inquiry: ${subject || "Project Inquiry"}`,
      text: `
New portfolio contact form inquiry.

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Company: ${company || "Not provided"}
Industry: ${industry || "Not provided"}
Project Type: ${projectType || "Not provided"}
Timeline: ${timeline || "Not provided"}
Budget: ${budget || "Not provided"}
Preferred Contact: ${preferredContactMethod || "Not provided"}

Message:
${message}
      `,
    });

    console.log("Contact email sent successfully:", info.messageId);

    return info;
  } catch (error) {
    console.error("Gmail SMTP detailed error:", error);
    throw error;
  } finally {
    transporter.close();
  }
}
