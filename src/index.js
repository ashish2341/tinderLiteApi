const express = require("express");
const app = express();
let cors = require("cors");
require("dotenv").config();
const allRouters = require("./api/routers/routeIndex");
const fileUpload = require("express-fileupload");
const http = require("http");
const server = http.createServer(app);
const Chats = require("./models/chatsModel")

const path = require("path");
const { connectDB } = require("./db/db");

// db
// Connect to MongoDB
connectDB().catch((err) => {
  console.error("Error connecting to MongoDB:", err);
  process.exit(1);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

//routes
app.use("/v1", allRouters);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  // Listen for private messages
  socket.on('chat-message', async (data) => {
    const { sender, target, content, timestamp } = data;

    try {
      const datenow = Date.now()
      
      const newMessage = new Chats({
        sender: sender,
        target: target,
        content: content,
        timestamp: timestamp
      });

      await newMessage.save();

      io.to(target).emit('new-message', {
        sender: sender,
        content: content,
        timestamp: timestamp
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('join-room', async (data) => {
    let { sender, target } = data
    socket.join(sender);
    let userData = await Chats.find({
      $or: [
        { sender, target },
        { sender: target, target: sender }
      ]
    }).sort({ timestamp: 1 })

    if (!userData) {
      console.log("user data not found");
    }
    socket.emit('join-room', userData)
    console.log(`User ${sender} joined the room`);
  });

  socket.on('disconnect', () => {
    console.log("A user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
