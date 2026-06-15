const Notification = require("../models/notification.model");
const { sendToUser } = require("./socket.service");

/**
 * Creates a notification in the database and pushes it to the user via Socket.io in real-time.
 * 
 * @param {Object} params
 * @param {string} params.userId - The recipient's user ID
 * @param {string} params.type - Notification type enum (order, drop, offer, royalty, stock, system)
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification descriptive message
 * @param {Object} [params.data] - Optional metadata (orderId, productId, dropId, offerId)
 */
const createNotification = async ({ userId, type, title, message, data }) => {
    try {
        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            data: data || {},
        });

        // Push via Socket.io in real-time
        sendToUser(userId, "notification", notification);

        return notification;
    } catch (error) {
        console.error("Error creating/sending notification:", error);
    }
};

module.exports = {
    createNotification,
};
