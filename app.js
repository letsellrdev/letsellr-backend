// app.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import adminrouter from "./routes/adminroute.js";
// import listing from "./routes/listingroute.js"; // Removed as it is merged into property and category routes
import categoryrouter from "./routes/categoryrouter.js";
import propertyrouter from "./routes/propertyroute.js";
import locationrouter from "./routes/locationrouter.js";
import { userrouter } from "./routes/userrouter.js";
import { feedbackrouter } from "./routes/feedbackrouter.js";
import authRoutes from "./routes/authRoutes.js";
import propertyTypeRouter from "./routes/propertytyperouter.js";
import settingsRouter from "./routes/settingsrouter.js";
import statisticRouter from "./routes/statistic.router.js";
import testimonialRouter from "./routes/testimonial.router.js";

// Import passport config
import "./passport.js";
import morgan from "morgan";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use((req, res, next) => {
  cors({
    origin: [req.headers.origin],
    credentials: true,
  })(req, res, next);
});

// "http://localhost:8080", "http://localhost:5173", "http://13.232.71.99", "https://letsellr.shanuvr.in"

// Session + store
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.URI }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/alive", (req, res) => res.send("Yep, i am alive (letsellr backend)"));

// Routes
// app.use("/letseller/show", listing); // Removed
app.use("/letseller/admin", adminrouter);
app.use("/letseller/property", propertyrouter);
app.use("/letseller/category", categoryrouter);
app.use("/letseller/location", locationrouter);
app.use("/letseller/user", userrouter);
app.use("/letseller/feedback", feedbackrouter);
app.use("/letseller/auth", authRoutes);
app.use("/letseller/propertytype", propertyTypeRouter);
app.use("/letseller/settings", settingsRouter);
app.use("/letseller/statistic", statisticRouter);
app.use("/letseller/testimonial", testimonialRouter);

// Protected route example
app.get("/letseller/protected", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.send(`Hello ${req.user.email}`);
  }
  res.status(401).send("Not authenticated");
});

// DB & Server start
mongoose
  .connect(process.env.URI)
  .then(() => {
    console.log("✅ Database connected successfully");

    const PORT = process.env.PORT || 4500;
    app.listen(PORT, () => {
      console.log(`🚀 Server started running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ DB connection error:", err));
