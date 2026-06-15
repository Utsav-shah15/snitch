const Notification = require("../models/notification.model");

// GET /api/notifications — user's notifications 
const getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({ user: req.user._id });
        const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

        res.status(200).json({
            notifications,
            unreadCount,
            page,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
};

// GET /api/notifications/unread-count — badge counter
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user._id,
            isRead: false,
        });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching unread count", error: error.message });
    }
};

// PATCH /api/notifications/:id/read — mark single notification as read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ notification });
    } catch (error) {
        res.status(500).json({ message: "Error marking notification as read", error: error.message });
    }
};

// PATCH /api/notifications/read-all — mark all as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error marking notifications as read", error: error.message });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
};
