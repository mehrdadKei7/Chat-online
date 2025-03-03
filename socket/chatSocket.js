const User = require("../models/User");
const Message = require("../models/Message");

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", async ({ username, room }) => {
      let user = await User.findOne({ username, room: room });

      if (user) {
        user.socketId = socket.id;
        user.isOnline = true;

        const recentMessages = await Message.find({ room })
        .sort({ createdAt: -1 })
        .lean();

      const filteredMessages = recentMessages.map(
        ({ sender, text, createdAt }) => ({
          username: sender,
          text: text,
          time: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
        })
      );

      socket.emit("loadMessages", filteredMessages.reverse());



      } else {
        user = new User({
          username,
          room,
          socketId: socket.id,
          isOnline: true,
        });

        const recentMessages = await Message.find({ room })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      const filteredMessages = recentMessages.map(
        ({ sender, text, createdAt }) => ({
          username: sender,
          text: text,
          time: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
        })
      );

      socket.emit("loadMessages", filteredMessages.reverse());

        socket.broadcast.to(room).emit("message", {
          username: "System",
          text: `${username} has joined the chat!`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
        });


        socket.emit("message", {
          username: "System",
          text: `Welcome to ${room} chat room, ${username}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
        });
      }

      await user.save();
      socket.join(room);

      async function sendRoomUsers(room) {
        const users = await User.find({ room });
        io.to(room).emit("roomUsers", { room, users });
      }

      await sendRoomUsers(room);
    });

    socket.on("chatMessage", async (message) => {
      const user = await User.findOne({ socketId: socket.id });
      if (user) {
        const newMessage = new Message({
          text: message,
          sender: user.username,
          room: user.room,
        });
        await newMessage.save();
        io.to(user.room).emit("message", {
          username: user.username,
          text: message,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
        });
      }
    });

    socket.on("typing", async () => {
      const user = await User.findOne({ socketId: socket.id });
      if (user) {
        socket.broadcast.to(user.room).emit("displayTyping", user.username);
      }
    });

    socket.on("stopTyping", async () => {
      const user = await User.findOne({ socketId: socket.id });
      if (user) {
        socket.broadcast.to(user.room).emit("removeTyping", user.username);
      }
    });

    socket.on("disconnect", async () => {
      const user = await User.findOne({ socketId: socket.id });
      if (user) {
        user.isOnline = false;
        await user.save();
        const users = await User.find({ room: user.room });
        io.to(user.room).emit("roomUsers", { room: user.room, users });
      }
    });

    socket.on("leaveRoom", async () => {
      const user = await User.findOneAndDelete({ socketId: socket.id });
      if (user) {
        io.to(user.room).emit("message", {
          username: "System",
          text: `${user.username} has left the chat!`,
          time: new Date().toLocaleTimeString(),
        });
      }

      const users = await User.find({ room: user.room });
      io.to(user.room).emit("roomUsers", { room: user.room, users });
    });
  });
};
