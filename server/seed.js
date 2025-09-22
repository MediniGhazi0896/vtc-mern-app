import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Review from "./models/Review.js";
import Service from "./models/Service.js";
import Booking from "./models/Booking.js";
import User from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected");

    // Clear old demo data
    await Review.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await User.deleteMany({ email: /driver_demo/i });
    await User.deleteMany({ email: "rider@example.com" });

    // Ensure demo rider exists
    const hashedPassword = await bcrypt.hash("password123", 12);
    const demoUser = await User.create({
      name: "Demo Rider",
      email: "rider@example.com",
      phone: "+491234567890", // ✅ added
      password: hashedPassword,
      role: "traveller",
      isAvailable: true,
      profileImage: "",
    });

    // 🚗 Demo drivers with avatars
    const driverNames = [
      "Alex M.",
      "Sofia L.",
      "David R.",
      "Lena K.",
      "Max B.",
      "Nora F.",
      "Jonas W.",
      "Emma T.",
      "Felix D.",
      "Mila H.",
    ];

    const avatarUrls = driverNames.map(
      (_, i) => `/uploads/profile/demo_driver_${i + 1}.png`
    );

    const hashedDriverPass = await bcrypt.hash("driverpass123", 12);

    const drivers = await User.insertMany(
      driverNames.map((name, i) => ({
        name,
        email: `driver_demo_${i + 1}@example.com`,
        phone: `+49123456789${i}`, // ✅ unique phone per driver
        password: hashedDriverPass,
        role: "driver",
        isAvailable: Math.random() > 0.5,
        profileImage: avatarUrls[i],
      }))
    );

    // Insert demo services
    await Service.insertMany([
      {
        title: "Standard Ride",
        description: "Quick and affordable rides within the city.",
        icon: "🚖",
      },
      {
        title: "Business Class",
        description: "Premium rides for meetings and events.",
        icon: "💼",
      },
      {
        title: "Package Delivery",
        description: "Fast and secure delivery across the city.",
        icon: "📦",
      },
      {
        title: "Airport Transfer",
        description: "Reliable rides to and from the airport.",
        icon: "✈️",
      },
    ]);

    // Seed fake German bookings
    const germanRoutes = [
      ["Berlin", "Munich"],
      ["Hamburg", "Berlin"],
      ["Frankfurt", "Munich"],
      ["Stuttgart", "Frankfurt"],
      ["Cologne", "Düsseldorf"],
      ["Berlin", "Hamburg"],
      ["Munich", "Stuttgart"],
      ["Berlin", "Leipzig"],
      ["Frankfurt", "Cologne"],
      ["Berlin", "Frankfurt"],
    ];

    const bookingStatuses = [
      "pending",
      "completed",
      "cancelled",
    ];

    const demoBookings = germanRoutes.flatMap(([from, to]) =>
  Array.from({ length: Math.floor(Math.random() * 15) + 5 }, () => ({
    userId: demoUser._id,
    pickupLocation: from,
    destination: to,
    status:
      bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)],
    assignedDriver:
      drivers[Math.floor(Math.random() * drivers.length)]._id,
    price: Math.floor(Math.random() * 90) + 10, // ✅ random €10–100
  }))
);


    const bookings = await Booking.insertMany(demoBookings);

    // Reviews linked only to completed bookings
    const sampleReviews = [
      "Amazing service! The driver was very professional and friendly.",
      "Smooth ride, arrived on time, will definitely use again!",
      "Affordable and easy booking process, loved it.",
      "The ride was fine, but the car could have been cleaner.",
      "Very reliable, especially for airport transfers.",
    ];

    const completedBookings = bookings.filter((b) => b.status === "completed");

    const reviewsToInsert = completedBookings.slice(0, 5).map((b, i) => ({
      user: b.userId,
      rating: Math.floor(Math.random() * 2) + 4,
      comment: sampleReviews[i],
    }));

    if (reviewsToInsert.length > 0) {
      await Review.insertMany(reviewsToInsert);
    }

    console.log(
      "✅ Demo data (drivers w/ avatars, services, bookings w/ random status, reviews, phones) seeded successfully!"
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();
