import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendInvoiceEmail = async (to, subject, text, pdfPath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"DriveLink Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      attachments: [
        {
          filename: pdfPath.split("/").pop(),
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    });

    console.log("📧 Invoice email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
  }
};
