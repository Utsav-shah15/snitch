const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:5174"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("join", (userId) => {
            if (userId) {
                const roomName = `user_${userId}`;
                socket.join(roomName);
                console.log(`Socket ${socket.id} joined room ${roomName}`);
            }
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const broadcast = (event, data) => {
    if (io) {
        io.emit(event, data);
        console.log(`Broadcasted event: ${event}`);
    }
};

const sendToUser = (userId, event, data) => {
    if (io && userId) {
        const roomName = `user_${userId}`;
        io.to(roomName).emit(event, data);
        console.log(`Sent event ${event} to room ${roomName}`);
    }
};

module.exports = {
    initSocket,
    getIO,
    broadcast,
    sendToUser,
};
