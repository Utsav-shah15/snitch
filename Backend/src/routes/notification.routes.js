const { Router } = require("express");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} = require("../controllers/notification.controller");

const router = Router();

router.get("/", isAuthenticated, getNotifications);
router.get("/unread-count", isAuthenticated, getUnreadCount);
router.patch("/read-all", isAuthenticated, markAllAsRead);
router.patch("/:id/read", isAuthenticated, markAsRead);

module.exports = router;
