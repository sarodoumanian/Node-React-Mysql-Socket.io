import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql";
import cors from "cors";
import cookieParser from "cookie-parser";
//import http from "http";
const app = express();

// const server = http.createServer(app);
// import { Server } from "socket.io";

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });

// const io = new Server(server, {
//   allowEIO3: true,
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// let clientSocketIds = [];
// let connectedUsers = [];

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(cookieParser());

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.getConnection((err, con) => {
  if (err) return console.log(err);
  console.log("connected to db...");
});

import userRouter from "./routes/user.js";
import postRouter from "./routes/post.js";
import msgRouter from "./routes/msg.js";

app.use("/", userRouter);
app.use("/", postRouter);
app.use("/", msgRouter);

// io.on("connection", (socket) => {
//   console.log("conected");
//   // socket.on("error", (err) => {
//   //   console.log(err);
//   // });

//   socket.on("disconnect", () => {
//     console.log("disconnected");
//     connectedUsers = connectedUsers.filter((item) => item.socketId != socket.id);
//     io.emit("updateUserList", connectedUsers);
//   });

//   socket.on("loggedin", function (user) {
//     console.log("nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn");
//     clientSocketIds.push({ socket: socket, userId: user.user_id });
//     connectedUsers = connectedUsers.filter((item) => item.user_id != user.user_id);
//     connectedUsers.push({ ...user, socketId: socket.id });
//     io.emit("updateUserList", connectedUsers);
//   });

//   socket.on("create", function (data) {
//     console.log("create room");
//     socket.join(data.room);
//     let withSocket = getSocketByUserId(data.withUserId);
//     socket.broadcast.to(withSocket.id).emit("invite", { room: data });
//   });
//   socket.on("joinRoom", function (data) {
//     socket.join(data.room.room);
//   });

//   socket.on("message", function (data) {
//     socket.broadcast.to(data.room).emit("message", data);
//   });
// });

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server Running on Port: ${PORT}`);
});

export { pool };
