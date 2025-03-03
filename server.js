const express = require("express");
const http = require("http");
const socket = require("socket.io");
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socket(server);

// اتصال به دیتابیس
connectDB();

// مدیریت ساکت‌ها
require("./socket/chatSocket")(io);

// استفاده از فایل‌های استاتیک
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
