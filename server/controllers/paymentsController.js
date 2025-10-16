// server/controllers/paymentsController.js
import Stripe from "stripe";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Booking from "../models/Booking.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import QRCode from "qrcode";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Stripe key:", process.env.STRIPE_SECRET_KEY ? "✅ Loaded" : "❌ Missing");

// helper
const toMinor = (amount) => Math.round(Number(amount) * 100);

/* -------------------------------------------------------------------------- */
/* ✉️ Send Invoice Email (must be defined BEFORE webhook)                     */
/* -------------------------------------------------------------------------- */
const sendInvoiceEmail = async (to, filePath) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ EMAIL_USER or EMAIL_PASS not set — skipping email send");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    const info = await transporter.sendMail({
      from: `"DriveLink Payments" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your DriveLink Ride Invoice",
      text: "Thank you for your payment! Your ride invoice is attached.",
      attachments: [{ filename: path.basename(filePath), path: filePath }],
    });

    console.log(`📧 Invoice emailed to: ${to} (Message ID: ${info.messageId})`);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
};

/* -------------------------------------------------------------------------- */
/* 🧾 Generate DriveLink Invoice (Final Visual + Data Fixes)                   */
/* -------------------------------------------------------------------------- */
const generateInvoice = async (payment) => {
  console.log("🔧 [generateInvoice] Start for:", payment._id);
  if (!payment.bookingId) console.warn("⚠️ [generateInvoice] No bookingId found on payment!");

  const invoicesDir = path.join(__dirname, "../invoices");
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

  const filename = `invoice_${payment._id}.pdf`;
  const filePath = path.join(invoicesDir, filename);

  // ✅ FIX 1: Proper user population
  let booking = null;
  try {
    booking = await Booking.findById(payment.bookingId).populate("userId"); // changed
    console.log("📦 [generateInvoice] Booking loaded:", booking?._id || "❌ none");
  } catch (err) {
    console.warn("⚠️ [generateInvoice] Booking lookup failed:", err.message);
  }

  const user = booking?.userId || {};
  console.log("👤 [generateInvoice] User data:", user);
  console.log("💳 [generateInvoice] Payment details:", {
    brand: payment.cardBrand,
    last4: payment.cardLast4,
    method: payment.method,
    amount: payment.amount,
  });

  const doc = new PDFDocument({ size: "A4", margin: 45, bufferPages: false });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  /* HEADER */
  doc.rect(0, 0, doc.page.width, 80).fill("#1976d2");
  doc.fillColor("white").fontSize(26).font("Helvetica-Bold").text("INVOICE", 50, 25);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("white")
    .text(`Invoice ID: ${payment._id}`, 0, 26, { align: "right", width: doc.page.width - 60 })
    .text(`Date: ${new Date().toLocaleString("en-DE")}`, 0, 42, {
      align: "right",
      width: doc.page.width - 60,
    });

  /* COMPANY INFO */
  const logoPath = path.join(__dirname, "../assets/drivelink-logo.png");
  if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 95, { width: 75 });
  doc
    .fillColor("#222")
    .fontSize(10)
    .font("Helvetica")
    .text("DriveLink - Mobility Technologies GmbH", 145, 95)
    .text("Neuprüll 19B, 93051 Regensburg, Germany", 145, 110)
    .text("USt-IdNr: DE329548713", 145, 125)
    .text("support@drivelink.com | +49 176 833 79 490", 145, 140)
    .text("www.drivelink.com", 145, 155);
  doc.moveTo(50, 165).lineTo(550, 165).strokeColor("#1976d2").stroke();

  /* BILLING INFO */
  const leftX = 60;
  const rightX = 330;
  const topY = 180;

  doc.font("Helvetica-Bold").fontSize(12).fillColor("#1976d2")
    .text("Billed From", leftX, topY)
    .text("Billed To", rightX, topY);

  doc.font("Helvetica").fontSize(10).fillColor("#000")
    .text("DriveLink Mobility Technologies GmbH", leftX, topY + 18)
    .text("Neuprüll 19B, 93051 Regensburg, Germany", leftX, topY + 32)
    .text("support@drivelink.com", leftX, topY + 46)
    .text("+49 176 833 79 490", leftX, topY + 60);

  doc.fontSize(10)
    .text(user.fullName || user.name || "DriveLink Customer", rightX, topY + 18)
    .text(user.email || "customer@drivelink.com", rightX, topY + 32)
    .text(user.address || "No address provided", rightX, topY + 46);

  doc.moveTo(50, 255).lineTo(550, 255).strokeColor("#ccc").stroke();

  /* PAYMENT SUMMARY TABLE */
  doc.font("Helvetica-Bold").fillColor("#1976d2").fontSize(12).text("Payment Summary", 60, 270);
  // ✅ FIX 2: Adjusted column layout for alignment
  const headers = ["Service", "Duration", "Pickup", "Destination", "Method", "Amount (€)"];
  const cols = [60, 140, 230, 320, 420, 510]; // widened spacing
  const rowY = 295;
  doc.fontSize(9);
  headers.forEach((h, i) => doc.text(h, cols[i], rowY));
  doc.moveTo(50, rowY + 12).lineTo(550, rowY + 12).strokeColor("#1976d2").stroke();

  const service = booking?.service || "Ride Hailing";
  const duration = booking?.duration || (booking?.eta ? `${booking.eta} min` : "N/A");
  const pickup = booking?.pickupLocation || "N/A";
  const destination = booking?.destination || "N/A";
  const brand = payment.cardBrand ? payment.cardBrand.toUpperCase() : "CARD";
  const last4 = payment.cardLast4 || "0000";
  const amount = `€ ${(payment.amount / 100).toFixed(2)}`;

  doc.font("Helvetica").fillColor("#000").fontSize(9)
    .text(service, cols[0], rowY + 18, { width: 70 })
    .text(duration, cols[1], rowY + 18, { width: 60 })
    .text(pickup, cols[2], rowY + 18, { width: 70 })
    .text(destination, cols[3], rowY + 18, { width: 70 })
    .text(`${brand} (****${last4})`, cols[4], rowY + 18, { width: 80 })
    .font("Helvetica-Bold")
    .text(amount, cols[5], rowY + 18, { align: "right", width: 60 });

  doc.moveTo(50, rowY + 34).lineTo(550, rowY + 34).strokeColor("#ccc").stroke();

  /* FOOTER - higher position (single-page fix) */
  const footerY = 380; // lowered from 390 to 360 for tighter layout
  const qrData = `https://drivelink.com/invoice/${payment._id}`;
  const qrImage = await QRCode.toDataURL(qrData);

  doc.font("Helvetica-Bold").fontSize(12).fillColor("#1976d2")
    .text("Thank you for choosing DriveLink!", 60, footerY)
    .font("Helvetica").fontSize(9.5).fillColor("#555")
    .text("For any inquiries, contact support@drivelink.com or call +49 176 833 79 490.", 60, footerY + 18, { width: 250 });

  doc.image(Buffer.from(qrImage.split(",")[1], "base64"), 440, footerY - 10, { width: 90 });
  doc.fontSize(8).fillColor("#444").text("Scan to view invoice online", 430, footerY + 90);

  // ✅ FIX 3: Footer raised up (prevent new page)
  const bottomY = doc.page.height - 60;
  doc.moveTo(50, bottomY).lineTo(550, bottomY).strokeColor("#1976d2").stroke();
  doc.fontSize(8).fillColor("#666")
    .text(`DriveLink © ${new Date().getFullYear()} | Neuprüll 19B, 93051 Regensburg, Germany`, 50, bottomY + 5, {
      align: "center",
      width: 500,
    });

  doc.end();
  return new Promise((resolve) =>
    stream.on("finish", () => {
      console.log("✅ [generateInvoice] PDF generated successfully:", filePath);
      resolve(filePath);
    })
  );
};

/* -------------------------------------------------------------------------- */
/* 🚀 Create Checkout Session (fixed metadata)                                */
/* -------------------------------------------------------------------------- */
export const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;
    console.log("🧾 [Checkout] Creating session for booking:", bookingId);

    const booking = await Booking.findById(bookingId).populate("user");
    console.log("📘 [Checkout] Booking found:", booking);

    const userEmail =
      booking.user?.email || req.user?.email || process.env.EMAIL_USER || "test@example.com";

    const meta = {
      bookingId: booking._id.toString(),
      userId:
        booking.user?._id?.toString() ||
        booking.userId?.toString() || // ✅ FIX 1
        req.user?._id?.toString() ||
        "unknown",
    };
    console.log("🧠 [Checkout] Metadata attached:", meta);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: userEmail,
      success_url: "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/payment-cancelled",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `DriveLink Ride to ${booking.destination}` },
            unit_amount: toMinor(booking.price || 0),
          },
          quantity: 1,
        },
      ],
      metadata: meta,
      payment_intent_data: { metadata: meta },
    });

    console.log("✅ [Checkout] Stripe session created:", session.id);
    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ [Checkout] Error:", err);
    res.status(500).json({ message: "Failed to create Stripe session" });
  }
};

/* -------------------------------------------------------------------------- */
/* ⚡ Stripe Webhook (duplicate protection + safe metadata)                   */
/* -------------------------------------------------------------------------- */
export const paymentsWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ [Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`🔔 [Webhook] Event: ${event.type}`);

  try {
    if (["checkout.session.completed", "payment_intent.succeeded"].includes(event.type)) {
      let paymentIntentId, customerEmail, metadata = {};

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        paymentIntentId = session.payment_intent;
        customerEmail = session.customer_email || session.customer_details?.email;
        metadata = session.metadata || {};
      } else {
        const intent = event.data.object;
        paymentIntentId = intent.id;
        customerEmail = intent.receipt_email;
        metadata = intent.metadata || {};
      }

      if (!metadata.userId || metadata.userId === "unknown")
        console.warn("⚠️ [Webhook] UserId missing in metadata!");

      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      metadata = { ...metadata, ...intent.metadata };
      console.log("🧠 [Webhook] Combined Metadata:", metadata);

      const latestChargeId = intent.latest_charge || intent.charges?.data?.[0]?.id;
      const charge = latestChargeId ? await stripe.charges.retrieve(latestChargeId) : null;
      console.log("💳 [Webhook] Charge Info:", {
        id: charge?.id,
        brand: charge?.payment_method_details?.card?.brand,
        last4: charge?.payment_method_details?.card?.last4,
      });

      const cardLast4 = charge?.payment_method_details?.card?.last4 || null;
      const cardBrand = charge?.payment_method_details?.card?.brand || null;
      const chargeId = charge?.id || null;
      const amountReceived = intent.amount_received || intent.amount || 0;
      const currency = (intent.currency || "eur").toUpperCase();

      let payment = await Payment.findOne({ paymentIntentId });
      if (!payment) {
        const safeUserId =
          metadata.userId && /^[a-f\d]{24}$/i.test(metadata.userId) ? metadata.userId : null;
        const safeBookingId =
          metadata.bookingId && /^[a-f\d]{24}$/i.test(metadata.bookingId)
            ? metadata.bookingId
            : null;
        payment = await Payment.create({
          userId: safeUserId,
          bookingId: safeBookingId,
          amount: amountReceived,
          currency,
          method: intent.payment_method_types?.[0] || "card",
          status: "succeeded",
          paymentIntentId,
          chargeId,
          cardLast4,
          cardBrand,
        });
        console.log("✅ [Webhook] Payment created:", payment._id.toString());
      } else {
        payment.status = "succeeded";
        payment.cardLast4 = cardLast4;
        payment.cardBrand = cardBrand;
        payment.amount = amountReceived;
        payment.currency = currency;
        await payment.save();
      }

      let booking = null;
      if (payment.bookingId) booking = await Booking.findById(payment.bookingId).populate("user");

      if (booking) {
        booking.paymentStatus = "paid";
        await booking.save();
      }

      // ✅ FIX 2: Prevent duplicate invoice generation
      const existingInvoice = await Invoice.findOne({ paymentId: payment._id });
      if (existingInvoice) {
        console.log("🧾 Invoice already exists — skipping regeneration.");
        return res.sendStatus(200);
      }

      const invoicePath = await generateInvoice(payment);
      const toEmail = customerEmail || booking?.user?.email || process.env.EMAIL_USER;
      if (toEmail) await sendInvoiceEmail(toEmail, invoicePath);

      console.log("🧾 [Webhook] Invoice created & emailed:", invoicePath);
    } else {
      console.log(`⚠️ [Webhook] Unhandled event type: ${event.type}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("🔥 [Webhook] Handler error:", err);
    res.status(500).send("Webhook handler error");
  }
};
