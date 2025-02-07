const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const paymentRoutes = require("./routes/paymentRoutes");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();
const app = express();

app.use(express.json());
app.use("/api/payments", paymentRoutes);

// Error Handling Middleware (must be at the end)
app.use(errorHandler);

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
