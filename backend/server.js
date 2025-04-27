const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const {notFound,errorHandler} = require("./middleware/errorMiddleware");
const cors = require('cors');
const frontendUrl = process.env.FRONTEND_URL;

dotenv.config();        
connectDB();
const app = express();

app.use(cors({
    origin: "https://chit-chat-app-q7xh.onrender.com",
    credentials: true,
  }));
  
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// app.get("/",(req,res) => {
//     res.send("Api is running");
// });

app.use("/api/user",userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/message",messageRoutes);

app.use(notFound);
app.use(errorHandler);

const port=process.env.PORT || 5000;
const server = app.listen(port, console.log(`server running on PORT : ${port}`));

const io = require("socket.io")(server,{
    pingTimeout: 60000,
    cors: {
        origin: "https://chit-chat-app-q7xh.onrender.com",
    }
});

io.on("connection", (socket) => {
    console.log("connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat",(room) => {
        socket.join(room);
        console.log("user joined room "+room); 
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;
        if(!chat.users) return console.log("chat users not defined");
        
        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received",newMessageReceived);
        });
    });

    socket.off("setup",() => {
        console.log("User Disconnected");
        socket.leave(userData._id);
    })
});
