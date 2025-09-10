import express from "express";
import NodeCache from "node-cache";
import Service from "../models/Service.js";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

const router = express.Router();
const cache = new NodeCache({ stdTTL: 300 }); // cache for 5 minutes

// ✅ Helper: check cache first
const cacheMiddleware = (key, fetchFn) => async (req, res) => {
  try {
    if (cache.has(key)) {
      return res.json(cache.get(key));
    }
    const data = await fetchFn();
    cache.set(key, data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch " + key });
  }
};

// ✅ Services
router.get("/services", cacheMiddleware("services", async () => {
  return await Service.find();
}));

// ✅ Highlights
router.get("/highlights", cacheMiddleware("highlights", async () => {
  const totalRides = await Booking.countDocuments();
  const activeDrivers = await User.countDocuments({ role: "driver", isAvailable: true });
  const happyCustomers = await Review.countDocuments({ rating: { $gte: 4 } });
  return { totalRides, activeDrivers, happyCustomers };
}));

// ✅ Popular routes
router.get("/popular-routes", cacheMiddleware("popular-routes", async () => {
  return await Booking.aggregate([
    {
      $group: {
        _id: { from: "$pickupLocation", to: "$destination" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);
}));

// ✅ Reviews
router.get("/reviews", cacheMiddleware("reviews", async () => {
  return await Review.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .populate("user", "name");
}));

export default router;
