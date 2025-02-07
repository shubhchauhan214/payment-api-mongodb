const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel"); // User schema for wallet/balance

// 🔹 Initialize Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

// 🔹 Create a Payment Order
const createPayment = async (req, res) => {
    try {
        const { amount, currency, receipt } = req.body;

        const options = {
            amount: amount * 100, 
            currency,
            receipt,
            payment_capture: 1, 
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Payment creation failed", error });
    }
};

// 🔹 Verify Payment Signature
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        const payment = new Payment({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            status: "Paid",
        });

        await payment.save();
        res.status(200).json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error verifying payment", error });
    }
};

// 🔹 Get Payment Status
const getPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findOne({ paymentId });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        res.status(200).json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching payment status", error });
    }
};

// 🔹 Refund Payment
const refundPayment = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const refund = await razorpay.payments.refund(paymentId);

        res.status(200).json({ success: true, refund });
    } catch (error) {
        res.status(500).json({ success: false, message: "Refund failed", error });
    }
};

// 🔹 Get User Transactions
const getUserTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await Payment.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching transactions", error });
    }
};

// 🔹 Get User Balance
const getUserBalance = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, balance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching balance", error });
    }
};

// 🔹 Withdraw Funds
const withdrawFunds = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findById(userId);

        if (!user || user.walletBalance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        user.walletBalance -= amount;
        await user.save();

        res.status(200).json({ success: true, message: "Withdrawal successful" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error processing withdrawal", error });
    }
};

// 🔹 Transfer Funds (P2P Transfers)
const transferFunds = async (req, res) => {
    try {
        const { senderId, receiverId, amount } = req.body;

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver || sender.walletBalance < amount) {
            return res.status(400).json({ success: false, message: "Invalid transfer" });
        }

        sender.walletBalance -= amount;
        receiver.walletBalance += amount;

        await sender.save();
        await receiver.save();

        res.status(200).json({ success: true, message: "Funds transferred successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error processing transfer", error });
    }
};

module.exports = { createPayment, verifyPayment, refundPayment, getPaymentStatus, getUserTransactions, withdrawFunds, transferFunds, getUserBalance };
