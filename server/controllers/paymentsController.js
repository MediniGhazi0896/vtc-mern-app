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

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const __dirname = path.resolve();

// Utility
const toMinor = (amount) => Math.round(Number(amount) * 100);
console.log("Stripe key:", process.env.STRIPE_SECRET_KEY ? "✅ Loaded" : "❌ Missing");

/* -------------------------------------------------------------------------- */
/* 🧾 Helper: Generate PDF Invoice                                            */
/* -------------------------------------------------------------------------- */
const generateInvoice = async (payment, booking) => {
  const invoicesDir = path.join(__dirname, "server", "invoices");
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

  const filePath = path.join(invoicesDir, `invoice_${payment._id}.pdf`);
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc
    .fontSize(20)
    .text("DriveLink Ride Invoice", { align: "center" })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(`Invoice ID: ${payment._id}`)
    .text(`Booking ID: ${booking?._id || "N/A"}`)
    .text(`User ID: ${payment.userId}`)
    .text(`Amount: €${(payment.amount / 100).toFixed(2)}`)
    .text(`Payment Status: ${payment.status}`)
    .text(`Date: ${new Date().toLocaleString()}`)
    .moveDown(2)
    .text("Thank you for riding with DriveLink!", { align: "center" });

  doc.end();

  return new Promise((resolve) => {
    stream.on("finish", () => resolve(filePath));
  });
};

/* -------------------------------------------------------------------------- */
/* ✉️ Helper: Email invoice                                                  */
/* -------------------------------------------------------------------------- */
const sendInvoiceEmail = async (to, filePath) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ EMAIL_USER or EMAIL_PASS not set — skipping email send");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"DriveLink Payments" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your DriveLink Ride Invoice",
    text: "Thank you for your payment! Your ride invoice is attached.",
    attachments: [{ filename: path.basename(filePath), path: filePath }],
  });

  console.log(`📧 Invoice emailed to: ${to}`);
};

/* -------------------------------------------------------------------------- */
/* 🚀 Create Payment Intent                                                  */
/* -------------------------------------------------------------------------- */
export const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (String(booking.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const amount = toMinor(booking.price || 0);
    if (amount <= 0) return res.status(400).json({ message: "Invalid booking amount" });

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: String(booking._id),
        userId: String(req.user._id),
      },
    });

    await Payment.create({
      userId: req.user._id,
      bookingId: booking._id,
      amount,
      currency: "EUR",
      method: "card",
      status:
        intent.status === "requires_payment_method" ? "requires_payment" : intent.status,
      paymentIntentId: intent.id,
    });

    return res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (err) {
    console.error("createPaymentIntent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ Confirm Payment Server-side                                            */
/* -------------------------------------------------------------------------- */
export const confirmPaymentServer = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId)
      return res.status(400).json({ message: "paymentIntentId is required" });

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const payment = await Payment.findOne({ paymentIntentId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (
      String(payment.userId) !== String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (intent.status === "succeeded") {
      const charge = intent.latest_charge
        ? await stripe.charges.retrieve(intent.latest_charge)
        : null;

      payment.status = "succeeded";
      payment.chargeId = charge?.id || null;
      payment.receiptUrl = charge?.receipt_url || null;
      await payment.save();

      const invoice = await Invoice.create({
        userId: payment.userId,
        bookingId: payment.bookingId,
        paymentId: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: "paid",
      });

      return res.json({ message: "Payment confirmed", payment, invoice });
    }

    payment.status = intent.status;
    await payment.save();
    return res.json({ message: "Payment not yet succeeded", status: intent.status });
  } catch (err) {
    console.error("confirmPaymentServer error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/* ⚡ Stripe Webhook                                                        */
/* -------------------------------------------------------------------------- */
export const paymentsWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`🔔 Stripe event received: ${event.type}`);

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        const payment = await Payment.findOne({ paymentIntentId: intent.id }).populate("bookingId");
       if (!payment) {
  console.warn("⚠️ Payment not found for intent:", intent.id, "→ creating a standalone record");
  const newPayment = await Payment.create({
    userId: null, // unknown in CLI test
    bookingId: null,
    amount: intent.amount_received,
    currency: intent.currency.toUpperCase(),
    method: intent.payment_method_types?.[0] || "card",
    status: "succeeded",
    paymentIntentId: intent.id,
    chargeId: intent.latest_charge || null,
  });

  const invoicePath = await generateInvoice(newPayment, null);
  await Invoice.create({
    userId: null,
    bookingId: null,
    paymentId: newPayment._id,
    amount: newPayment.amount,
    currency: newPayment.currency,
    method: newPayment.method,
    status: "paid",
    pdfUrl: invoicePath,
  });

  console.log("🧾 Standalone invoice created for CLI test:", invoicePath);
  break;
}


        payment.status = "succeeded";
        await payment.save();

        const booking = await Booking.findById(payment.bookingId);
        const invoicePath = await generateInvoice(payment, booking);
        console.log("🧾 Invoice created at:", invoicePath);

        const invoice = await Invoice.create({
          userId: payment.userId,
          bookingId: payment.bookingId,
          paymentId: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: "paid",
          pdfUrl: invoicePath,
        });

        // Email invoice if possible
        const customerEmail = intent?.receipt_email || booking?.userEmail || null;
        if (customerEmail) await sendInvoiceEmail(customerEmail, invoicePath);

        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("🔥 Webhook handler error:", err);
    res.status(500).send("Webhook handler error");
  }
};
