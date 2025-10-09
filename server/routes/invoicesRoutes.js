import express from "express";
import { listMyInvoices, getInvoice } from "../controllers/invoicesController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", authenticate, listMyInvoices);
router.get("/:id", authenticate, getInvoice);

export default router;
