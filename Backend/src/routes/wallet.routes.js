const { Router } = require("express");
const { isAuthenticated, authenticateSeller } = require("../middlewares/auth.middleware");
const { getWallet, getTransactions, requestWithdrawal } = require("../controllers/wallet.controller");

const router = Router();

router.get("/", isAuthenticated, authenticateSeller, getWallet);
router.get("/transactions", isAuthenticated, authenticateSeller, getTransactions);
router.post("/withdraw", isAuthenticated, authenticateSeller, requestWithdrawal);

module.exports = router;
