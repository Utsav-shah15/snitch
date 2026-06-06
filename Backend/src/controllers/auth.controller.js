const User = require("../models/user.models");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

// Helper — sign JWT & send response
async function sendToken(user, res, message, statusCode = 200) {
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
        httpOnly: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(statusCode).json({
        message,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            contactNumber: user.contactNumber,
            isSeller: user.isSeller,
            sellerProfile: user.sellerProfile,
            wallet: user.wallet,
        },
    });
}

// POST /api/auth/register
async function registerUser(req, res) {
    const { fullName, email, contactNumber, password } = req.body;

    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { contactNumber }],
        });
        if (existingUser) {
            return res.status(400).json({ error: "Email or contact number already exists" });
        }

        const newUser = await User.create({
            fullName,
            email,
            contactNumber,
            password,
        });

        sendToken(newUser, res, "User registered successfully", 201);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}

// POST /api/auth/login
async function loginUser(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        sendToken(user, res, "Login successful");
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}

// GET /api/auth/getMe
async function getMe(req, res) {
    try {
        const user = req.user;
        res.status(200).json({
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                contactNumber: user.contactNumber,
                isSeller: user.isSeller,
                sellerProfile: user.sellerProfile,
                wallet: user.wallet,
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}

// GET /api/auth/logout
async function logoutUser(req, res) {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
}

// PATCH /api/auth/become-seller
async function becomeSeller(req, res) {
    try {
        const { shopName, bio } = req.body;

        if (!shopName || shopName.trim().length < 3) {
            return res.status(400).json({ error: "Shop name must be at least 3 characters" });
        }

        const user = req.user;

        if (user.isSeller) {
            return res.status(400).json({ error: "You are already a seller" });
        }

        user.isSeller = true;
        user.sellerProfile = {
            shopName: shopName.trim(),
            bio: bio?.trim() || "",
            avatar: "",
            joinedAt: new Date(),
        };

        await user.save();

        res.status(200).json({
            message: "You are now a seller!",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                isSeller: user.isSeller,
                sellerProfile: user.sellerProfile,
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}

// GET /api/auth/google
async function googleAuth(req, res) {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(config.GOOGLE_CALLBACK_URL)}&response_type=code&scope=profile%20email`;
    res.redirect(googleAuthUrl);
}

// GET /api/auth/google/callback
async function googleCallback(req, res) {
    const { code } = req.query;
    if (!code) {
        return res.redirect("http://localhost:5173/login?error=Google auth failed");
    }

    try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code,
                client_id: config.GOOGLE_CLIENT_ID,
                client_secret: config.GOOGLE_CLIENT_SECRET,
                redirect_uri: config.GOOGLE_CALLBACK_URL,
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenResponse.json();
        if (!tokens.access_token) {
            return res.redirect("http://localhost:5173/login?error=Failed to retrieve access token");
        }

        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const userInfo = await userInfoResponse.json();
        if (!userInfo.email) {
            return res.redirect("http://localhost:5173/login?error=Failed to retrieve email");
        }

        let user = await User.findOne({
            $or: [{ googleId: userInfo.sub }, { email: userInfo.email }],
        });

        if (!user) {
            user = await User.create({
                fullName: userInfo.name || "Google User",
                email: userInfo.email,
                googleId: userInfo.sub,
            });
        } else if (!user.googleId) {
            user.googleId = userInfo.sub;
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect("http://localhost:5173/");
    } catch (error) {
        console.error("Google OAuth Error:", error);
        res.redirect("http://localhost:5173/login?error=OAuth Server Error");
    }
}

module.exports = {
    registerUser,
    loginUser,
    getMe,
    logoutUser,
    becomeSeller,
    googleAuth,
    googleCallback,
};
