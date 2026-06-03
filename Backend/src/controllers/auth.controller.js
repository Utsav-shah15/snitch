const User = require("../models/user.models");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

async function sendToken(user, res, message) {
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token);

    res.status(200).json({
        message,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            contactNumber: user.contactNumber,
            role: user.role
        }
    })
} 

async function registerUser(req, res) {
    const { fullName, email, contactNumber, password, isSeller } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { contactNumber }] });
        if (existingUser) {
            return res.status(400).json({ error: "Email or contact number already exists" });
        }

        const newUser = await User.create({
            fullName,
            email,
            contactNumber,
            password,
            role: isSeller ? "seller" : "buyer"
        });

        sendToken(newUser, res, "user registered successfully");
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}

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
async function getMe(req, res) {
    try {
        const user = req.user;
        res.status(200).json({
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                contactNumber: user.contactNumber,
                role: user.role
            }
        });
    }catch(error){
        res.status(500).json({ error: "Server Error" });
    }
}

async function googleAuth(req, res) {
    const role = req.query.role || "buyer";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(config.GOOGLE_CALLBACK_URL)}&response_type=code&scope=profile%20email&state=${role}`;
    res.redirect(googleAuthUrl);
}

async function googleCallback(req, res) {
    const { code, state: role } = req.query;
    if (!code) {
        return res.redirect("http://localhost:5173/login?error=Google auth failed");
    }

    try {
        // Exchange authorization code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code,
                client_id: config.GOOGLE_CLIENT_ID,
                client_secret: config.GOOGLE_CLIENT_SECRET,
                redirect_uri: config.GOOGLE_CALLBACK_URL,
                grant_type: "authorization_code"
            })
        });

        const tokens = await tokenResponse.json();
        if (!tokens.access_token) {
            return res.redirect("http://localhost:5173/login?error=Failed to retrieve access token");
        }

        // Fetch user info from Google
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });

        const userInfo = await userInfoResponse.json();
        if (!userInfo.email) {
            return res.redirect("http://localhost:5173/login?error=Failed to retrieve email");
        }

        // Find or create user
        let user = await User.findOne({ email: userInfo.email });
        if (!user) {
            user = await User.create({
                fullName: userInfo.name || "Google User",
                email: userInfo.email,
                contactNumber: "0000000000", // placeholder since contactNumber is required in mongoose schema
                password: Math.random().toString(36).slice(-10), // placeholder password
                role: role === "seller" ? "seller" : "buyer"
            });
        }

        // Sign token and set cookie
        const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: false,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
    googleAuth,
    googleCallback
}
