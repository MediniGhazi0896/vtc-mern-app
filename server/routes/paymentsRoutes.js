// server/routes/paymentsRoutes.js
import express from "express";
import {
  createPaymentIntent,
  confirmPaymentServer,
  paymentsWebhook,
} from "../controllers/paymentsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ⚡ Stripe webhook (must come BEFORE express.json)
export const paymentsWebhookRoute = express.Router();
paymentsWebhookRoute.post(
  "/",
  express.raw({ type: "application/json" }),
  paymentsWebhook
);

// 🔒 Authenticated routes
router.post("/create-intent", authenticate, createPaymentIntent);
router.post("/confirm", authenticate, confirmPaymentServer);

export default router;
