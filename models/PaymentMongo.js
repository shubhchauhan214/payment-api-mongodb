const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true, 
        index: true // Optimized query performance 
    },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { 
        type: String, 
        enum: ["Pending", "Success", "Failed", "Refunded"], 
        default: "Pending" 
    },
    transactionId: { type: String, unique: true, sparse: true }, // Unique but sparse to avoid indexing empty values
    razorpayOrderId: { type: String, required: true, index: true }, // Added index for faster lookup
    failureReason: { type: String, default: null }, // Reason for payment failure
    refundStatus: { 
        type: String, 
        enum: ["Not Initiated", "Processing", "Completed"], 
        default: "Not Initiated" 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", PaymentSchema);
