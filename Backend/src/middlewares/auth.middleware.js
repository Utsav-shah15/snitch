const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const config = require("../config/config");

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "Please log in to access this resource." });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ error: "User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Session expired. Please log in again." });
    }
};

module.exports = { isAuthenticated };
