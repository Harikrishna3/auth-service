require("dotenv").config();
const { app, io } = require("./app");
const prisma = require("./config/database");
const prismaMessage = require("./config/messageDatabase");
const socketAuth = require("./middleware/socketAuth");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✓ Database connected successfully");

    // Apply JWT authentication middleware to socket.io
    io.use(socketAuth);

    io.on("connection", (socket) => {
      console.log(`✓ User connected: ${socket.user.email} (${socket.id})`);

      socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`✓ ${socket.user.email} joined room ${roomId}`);
      });

      socket.on("sendMessage", async ({ roomId, message }) => {
        try {
          // Save message to MongoDB
          const savedMessage = await prismaMessage.message.create({
            data: {
              roomId,
              message,
              senderId: socket.userId,
            },
          });

          // Get sender info from user database
          const sender = await prisma.user.findUnique({
            where: { id: socket.userId },
            select: {
              id: true,
              email: true,
              name: true,
            },
          });

          const payload = {
            id: savedMessage.id,
            roomId: savedMessage.roomId,
            message: savedMessage.message,
            senderId: savedMessage.senderId,
            sender: sender,
            createdAt: savedMessage.createdAt.toISOString(),
          };

          // Emit to all users in that room
          io.to(roomId).emit("newMessage", payload);
        } catch (error) {
          console.error("✗ Error saving message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      socket.on("getMessages", async ({ roomId, limit = 50, skip = 0 }) => {
        try {
          const messages = await prismaMessage.message.findMany({
            where: { roomId },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: skip,
          });

          // Get sender info for each message
          const messagesWithSender = await Promise.all(
            messages.map(async (msg) => {
              const sender = await prisma.user.findUnique({
                where: { id: msg.senderId },
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              });
              return { ...msg, sender };
            })
          );

          socket.emit("messageHistory", messagesWithSender.reverse());
        } catch (error) {
          console.error("✗ Error fetching messages:", error);
          socket.emit("error", { message: "Failed to fetch messages" });
        }
      });

      socket.on("disconnect", () => {
        console.log(
          `✗ User disconnected: ${socket.user.email} (${socket.id})`
        );
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
  await prismaMessage.$disconnect();
  process.exit(0);
});

startServer();
