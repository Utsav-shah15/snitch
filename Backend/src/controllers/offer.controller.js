const Offer = require("../models/offer.model");
const Product = require("../models/product.model");

// POST /api/offers — buyer makes an offer
const makeOffer = async (req, res) => {
    try {
        const { productId, offeredPrice, message } = req.body;

        if (!productId || !offeredPrice) {
            return res.status(400).json({ error: "Product and offered price are required" });
        }

        const product = await Product.findOne({ _id: productId, status: "active" });
        if (!product) {
            return res.status(404).json({ error: "Product not found or unavailable" });
        }

        // Can't make offer on your own product
        if (product.seller.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot make an offer on your own product" });
        }

        if (offeredPrice >= product.price.amount) {
            return res.status(400).json({ error: "Offer must be lower than the listed price" });
        }

        if (offeredPrice <= 0) {
            return res.status(400).json({ error: "Offer price must be greater than 0" });
        }

        // Check if there's already a pending offer from this buyer
        const existingOffer = await Offer.findOne({
            buyer: req.user._id,
            product: productId,
            status: "pending",
        });
        if (existingOffer) {
            return res.status(400).json({ error: "You already have a pending offer on this product" });
        }

        const offer = await Offer.create({
            buyer: req.user._id,
            seller: product.seller,
            product: productId,
            offeredPrice,
            message: message || "",
        });

        await offer.populate("product", "title images price");
        await offer.populate("buyer", "fullName");

        res.status(201).json({ message: "Offer submitted successfully", offer });
    } catch (error) {
        res.status(500).json({ error: "Error making offer", details: error.message });
    }
};

// GET /api/offers/my-offers — buyer sees their sent offers
const getMyOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ buyer: req.user._id })
            .sort({ createdAt: -1 })
            .populate("product", "title images price status")
            .populate("seller", "fullName sellerProfile");

        res.status(200).json({ offers });
    } catch (error) {
        res.status(500).json({ error: "Error fetching offers", details: error.message });
    }
};

// GET /api/offers/received — seller sees received offers
const getReceivedOffers = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { seller: req.user._id };
        if (status) filter.status = status;

        const offers = await Offer.find(filter)
            .sort({ createdAt: -1 })
            .populate("product", "title images price")
            .populate("buyer", "fullName email");

        res.status(200).json({ offers });
    } catch (error) {
        res.status(500).json({ error: "Error fetching received offers", details: error.message });
    }
};

// PATCH /api/offers/:id/accept — seller accepts offer
const acceptOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ error: "Offer not found" });

        if (offer.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }
        if (offer.status !== "pending" && offer.status !== "countered") {
            return res.status(400).json({ error: `Cannot accept an offer with status: ${offer.status}` });
        }

        offer.status = "accepted";
        await offer.save();

        res.status(200).json({ message: "Offer accepted", offer });
    } catch (error) {
        res.status(500).json({ error: "Error accepting offer", details: error.message });
    }
};

// PATCH /api/offers/:id/counter — seller counters offer
const counterOffer = async (req, res) => {
    try {
        const { counterPrice } = req.body;
        if (!counterPrice || counterPrice <= 0) {
            return res.status(400).json({ error: "Valid counter price is required" });
        }

        const offer = await Offer.findById(req.params.id).populate("product", "price");
        if (!offer) return res.status(404).json({ error: "Offer not found" });

        if (offer.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }
        if (offer.status !== "pending") {
            return res.status(400).json({ error: `Cannot counter an offer with status: ${offer.status}` });
        }
        if (counterPrice >= offer.product.price.amount) {
            return res.status(400).json({ error: "Counter must be less than the listed price" });
        }

        offer.counterPrice = counterPrice;
        offer.status = "countered";
        await offer.save();

        res.status(200).json({ message: "Counter offer sent", offer });
    } catch (error) {
        res.status(500).json({ error: "Error countering offer", details: error.message });
    }
};

// PATCH /api/offers/:id/decline — seller declines offer
const declineOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ error: "Offer not found" });

        if (offer.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }
        if (offer.status === "accepted" || offer.status === "declined") {
            return res.status(400).json({ error: `Offer is already ${offer.status}` });
        }

        offer.status = "declined";
        await offer.save();

        res.status(200).json({ message: "Offer declined", offer });
    } catch (error) {
        res.status(500).json({ error: "Error declining offer", details: error.message });
    }
};

// GET /api/offers/:id — get single offer details
const getOfferById = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id)
            .populate("product", "title images price status")
            .populate("seller", "fullName sellerProfile")
            .populate("buyer", "fullName email");

        if (!offer) return res.status(404).json({ error: "Offer not found" });

        // Only buyer or seller can view this offer
        if (offer.buyer._id.toString() !== req.user._id.toString() && 
            offer.seller._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        res.status(200).json({ offer });
    } catch (error) {
        res.status(500).json({ error: "Error fetching offer details", details: error.message });
    }
};

module.exports = { makeOffer, getMyOffers, getReceivedOffers, acceptOffer, counterOffer, declineOffer, getOfferById };
