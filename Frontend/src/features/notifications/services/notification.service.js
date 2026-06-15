import axios from 'axios';

const api = axios.create({
    baseURL: 'https://snitch-c04s.onrender.com/api/notifications',
    withCredentials: true,
});

// Get user's notifications
export const getNotifications = async (page = 1) => {
    const response = await api.get('/', { params: { page, limit: 20 } });
    return response.data;
};

// Get unread count for badge
export const getUnreadCount = async () => {
    const response = await api.get('/unread-count');
    return response.data;
};

// Mark single notification as read
export const markAsRead = async (id) => {
    const response = await api.patch(`/${id}/read`);
    return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    const response = await api.patch('/read-all');
    return response.data;
};
