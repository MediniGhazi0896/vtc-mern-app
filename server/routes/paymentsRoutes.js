// server/routes/paymentsRoutes.js
import express from "express";
import {
  paymentsWebhook,
  createCheckoutSession,
} from "../controllers/paymentsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Authenticated route — create Stripe Checkout session
router.post("/create-session", authenticate, createCheckoutSession); 

// ⚡ Stripe webhook (must come BEFORE express.json)
export const paymentsWebhookRoute = express.Router();
paymentsWebhookRoute.post(
  "/",
  express.raw({ type: "application/json" }),
  paymentsWebhook
);

/* // 🔒 Authenticated routes
router.post("/create-intent", authenticate, createPaymentIntent);
router.post("/confirm", authenticate, confirmPaymentServer); */

export default router;
