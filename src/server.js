import fs from "fs";
import path from "path";
import http from "http";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import jwt from "./utils/jwt.js";
import { Server } from "socket.io";
import { HOST, PORT } from "./config.js";
import { read, write } from "./utils/model.js";

import userRouter from "./routers/user.js";
import messageRouter from "./routers/message.js";

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(cors());

app.use(express.static(path.join(process.cwd(), "uploads")));

app.use(userRouter);
app.use(messageRouter);

app.use((error, req, res, next) => {
  if (error.status != 500) {
    return res.status(error.status).json({
      status: error.status,
      message: error.message,
    });
  }

  fs.appendFileSync(
    path.join(process.cwd(), "src", "log.txt"),
    `${req.url}___${error.name}___${new Date(Date.now())}___${error.status}___${error.message}\n`
  );

  res.status(error.status).json({
    status: error.status,
    message: "InternalServerError",
  });

  process.exit();
});

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (client) => {
  client.on("new message", ({ token, message }) => {
    let { userId } = jwt.verify(token);
    let messages = read("messages");

    let newMessage = {
      id: messages.length ? messages.at(-1).id + 1 : 1,
      user_id: userId,
      message_text: message,
      message_date: Date.now(),
      message_file: null,
    };

    messages.push(newMessage);
    write("messages", messages);

    client.broadcast.emit("send message", { data: [newMessage] });
  });
});

server.listen(PORT, () => console.log(`server run ${HOST}`));
