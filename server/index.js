// server.js
import { Server } from "socket.io";
import { createServer } from "http";
import { MongoClient, ObjectId } from "mongodb";

const PORT = 8080;
const MONGODB_URI = "mongodb+srv://tejas23100:0ZcrerBY3odcIoUV@data.ajawo.mongodb.net/zenlarn?retryWrites=true&w=majority";

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let db;

async function connectToMongo() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    db = client.db("zenlarn");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinChannel", async ({ channelId, userEmail }) => {
    try {
      const channel = await db.collection("channels").findOne({
        _id: new ObjectId(channelId), // Use _id instead of name
        participants: userEmail,
      });

      if (!channel) {
        socket.emit("error", { message: "Channel not found or unauthorized" });
        return;
      }

      socket.join(channelId);
      console.log(`${userEmail} joined channel ${channelId}`);

      const messages = await db
        .collection("messages")
        .find({ channelId })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      socket.emit("initialMessages", messages);
    } catch (error) {
      console.error("Error joining channel:", error);
      socket.emit("error", { message: "Failed to join channel" });
    }
  });

  socket.on("sendMessage", async ({ channelId, text, userEmail }) => {
    try {
      const message = {
        senderEmail: userEmail,
        channelId,
        text,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("messages").insertOne(message);
      const savedMessage = { ...message, _id: result.insertedId };

      io.to(channelId).emit("newMessage", savedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

async function startServer() {
  await connectToMongo();
  server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
  });
}

startServer();