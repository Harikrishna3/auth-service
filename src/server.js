require("dotenv").config();
const { app, io } = require("./app");
const prisma = require("./config/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✓ Database connected successfully");

    io.on("connection", (socket) => {
      console.log("user connected:", socket.id);

      // client sends: { roomId, message, senderId }
      socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`socket ${socket.id} joined room ${roomId}`);
      });

      socket.on("sendMessage", ({ roomId, message, senderId }) => {
        const payload = {
          roomId,
          message,
          senderId,
          createdAt: new Date().toISOString(),
        };

        // TODO: save to DB here

        // emit to all users in that room
        io.to(roomId).emit("newMessage", payload);
      });

      socket.on("disconnect", () => {
        console.log("user disconnected:", socket.id);
      });
    });

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
