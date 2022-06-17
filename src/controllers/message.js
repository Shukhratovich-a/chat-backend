import { read, write } from "../utils/model.js";

const GET = (req, res, next) => {
  try {
    const users = read("users");
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

export default { GET };
