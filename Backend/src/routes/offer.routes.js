const { Router } = require("express");
const { isAuthenticated, authenticateSeller } = require("../middlewares/auth.middleware");
const {
    makeOffer,
    getMyOffers,
    getReceivedOffers,
    acceptOffer,
    counterOffer,
    declineOffer,
    getOfferById,
} = require("../controllers/offer.controller");

const router = Router();

router.post("/", isAuthenticated, makeOffer);
router.get("/my-offers", isAuthenticated, getMyOffers);
router.get("/received", isAuthenticated, authenticateSeller, getReceivedOffers);
router.get("/:id", isAuthenticated, getOfferById);
router.patch("/:id/accept", isAuthenticated, authenticateSeller, acceptOffer);
router.patch("/:id/counter", isAuthenticated, authenticateSeller, counterOffer);
router.patch("/:id/decline", isAuthenticated, authenticateSeller, declineOffer);

module.exports = router;
