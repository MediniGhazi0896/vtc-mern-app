import Invoice from "../models/Invoice.js";

// GET /api/invoices/me
export const listMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("bookingId", "_id pickupLocation destination")
      .lean();

    return res.json(invoices);
  } catch (err) {
    console.error("listMyInvoices error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/invoices/:id
export const getInvoice = async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).lean();
    if (!inv) return res.status(404).json({ message: "Invoice not found" });
    if (String(inv.userId) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }
    return res.json(inv);
  } catch (err) {
    console.error("getInvoice error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
