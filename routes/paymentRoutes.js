const express = require("express");
const { 
    createPayment, 
    verifyPayment, 
    refundPayment, 
    getPaymentStatus, 
    getUserTransactions, 
    withdrawFunds, 
    transferFunds, 
    getUserBalance 
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create", createPayment); // Create a payment order
router.post("/verify", verifyPayment); // Verify payment signature
router.post("/refund", refundPayment); // Process a refund
router.get("/status/:paymentId", getPaymentStatus); // Get payment status
router.get("/transactions/:userId", getUserTransactions); // Get user's transactions
router.post("/withdraw", withdrawFunds); // Withdraw funds
router.post("/transfer", transferFunds); // Transfer funds
router.get("/balance/:userId", getUserBalance); // Get user balance

module.exports = router;
