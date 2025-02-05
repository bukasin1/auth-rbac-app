const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { authenticateToken } = require("./middlewares/authMiddleware");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

connectDB();

app.use("/auth", authRoutes);
app.use("/api", authenticateToken, apiRoutes);
app.use("/api/orders", authenticateToken, orderRoutes);

// Socket.io Real-Time Connections
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

global.io = io; // Export socket instance for use in other modules

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
