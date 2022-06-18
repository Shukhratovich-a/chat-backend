import fs from "fs";
import path from "path";
import http from "http";
import express from "express";
import fileUpload from "express-fileupload";
import { Server } from "socket.io";
import { HOST, PORT } from "./config.js";

import checkToken from "./middlewares/checkToken.js";

import userRouter from "./routers/user.js";
import messageRouter from "./routers/message.js";

const app = express();
app.use(express.json());
app.use(fileUpload());

app.use(express.static(path.join(process.cwd(), "uploads")));

app.use(checkToken);

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
  console.log(client.id);
});

server.listen(PORT, () => console.log(`server run ${HOST}`));
