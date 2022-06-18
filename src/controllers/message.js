import path from "path";
import { HOST } from "../config.js";
import { read, write } from "../utils/model.js";

const GET = (req, res, next) => {
  try {
    const users = read("users").map((user) => {
      if (user.avatar) user.avatar = `${HOST}/${user.avatar}`;
      return user;
    });

    const messages = read("messages").map((message) => {
      message.user = users.find((user) => user.id == message.user_id);

      delete message.user.password;
      delete message.user_id;

      return message;
    });

    res.status(200).json({
      status: 200,
      message: "success",
      userId: req.userId,
      data: messages,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

const DOWNLOAD = (req, res, next) => {
  try {
    const { fileName } = req.params;

    res.status(200).download(path.join(process.cwd(), uploads, fileName));
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

const POST = (req, res, next) => {
  try {
    const messages = read("messages");
    const users = read("users");

    req.body.id = messages.lenght ? messages.at(-1).id + 1 : 1;
    req.body.user_id = req.userId;
    req.body.message_date = Date.now();

    if (req.files) {
      const { file } = req.files;
      const fileName = Date.now() + file.name;
      file.mv(path.join(process.cwd(), "uploads", fileName));
      req.body.message_file = {
        name: fileName,
        size: file.size,
        mimetype: file.mimetype,
        show_link: `${HOST}/${fileName}`,
        download_link: `${HOST}/messages/${fileName}`,
      };
    } else {
      req.body.message_file = null;
    }

    messages.push(req.body);
    write("messages", messages);

    req.body.user = users.find((user) => user.id == req.body.user_id);
    req.body.user.avatar = `${HOST}/${req.body.user.avatar}`;

    delete req.body.user_id;
    delete req.body.user.password;

    res.status(200).json({
      status: 200,
      message: "success",
      userId: req.userId,
      data: req.body,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

export default { GET, POST, DOWNLOAD };
