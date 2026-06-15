require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/database");
const { initSocket } = require("./src/services/socket.service");

const PORT = process.env.PORT || 3000;
connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});