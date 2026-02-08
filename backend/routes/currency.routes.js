const express = require("express");
const router = express.Router();
const userCurrencyController = require("../controllers/userCurrency.controller");
const { authenticateToken } = require("../middleware/auth");

// GET /api/currency/balance
router.get("/balance", authenticateToken, userCurrencyController.getBalance);

module.exports = router;
