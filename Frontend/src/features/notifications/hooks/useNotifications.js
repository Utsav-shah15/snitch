import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import * as notificationService from '../services/notification.service';

const SOCKET_URL = 'http://localhost:3000';

const useNotifications = () => {
    const { user } = useSelector((state) => state.auth);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    // Fetch initial notifications list and unread count
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await notificationService.getNotifications(1);
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Mark single notification as read
    const markAsRead = useCallback(async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    }, []);

    // Setup Socket.io real-time connection
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        // Fetch notifications first
        fetchNotifications();

        // Connect socket
        const socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected client-side:', socket.id);
            // Join user-specific room
            const userId = user.id || user._id;
            socket.emit('join', userId);
        });

        // Listen for new notifications
        socket.on('notification', (newNotification) => {
            console.log('New notification received:', newNotification);
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Display alert or play sound (optional micro-interaction)
            if (Notification.permission === 'granted') {
                new Notification(newNotification.title, {
                    body: newNotification.message,
                });
            }
        });

        // Listen for drop live events
        socket.on('drop-live', (dropData) => {
            console.log('Drop live event received:', dropData);
            // Add a visual alert notification locally
            const mockNotification = {
                _id: Math.random().toString(),
                title: '🔥 Live Drop Started!',
                message: `"${dropData.title}" is now LIVE! Click here to check it out.`,
                type: 'drop',
                isRead: false,
                createdAt: new Date().toISOString(),
                data: { dropId: dropData.dropId },
            };
            setNotifications((prev) => [mockNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user, fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
};

export default useNotifications;
