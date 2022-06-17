import path from "path";
import sha256 from "sha256";
import jwt from "../utils/jwt.js";
import { write, read } from "../utils/model.js";
import { HOST } from "../config.js";
import { AuthorizationError, InternalServerError } from "../utils/errors.js";

const GET = (req, res, next) => {
  try {
    const users = read("users").map((user) => {
      if (user.avatar) user.avatar = `${HOST}/${user.avatar}`;
      delete user.password;

      return user;
    });

    res.status(200).json({
      status: 200,
      message: "success",
      userId: req.userId,
      data: users,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

const LOGIN = (req, res, next) => {
  try {
    const users = read("users");
    const { username, password } = req.body;

    const data = users.find(
      (user) =>
        user.username.toLowerCase() == username.toLowerCase() && user.password == sha256(password)
    );

    if (!data) return next(new AuthorizationError(401, "wrong username or password"));

    if (data.avatar) data.avatar = `${HOST}/${data.avatar}`;
    delete data.password;

    res.status(201).json({
      status: 201,
      message: "success",
      token: jwt.sign({ userId: data.id }),
      data: data,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

const REGISTER = (req, res, next) => {
  try {
    const users = read("users");

    req.body.id = users.length ? users.at(-1).id + 1 : 1;
    req.body.password = sha256(req.body.password);

    let user = users.find((user) => user.username.toLowerCase() == req.body.username.toLowerCase());

    if (user) return next(new AuthorizationError(401, "this username exits"));

    if (req.files) {
      const { avatar } = req.files;
      const fileName = Date.now() + avatar.name.replace(/\s/g, "");
      avatar.mv(path.join(process.cwd(), "uploads", fileName));
      req.body.avatar = fileName;
    } else {
      req.body.avatar = null;
    }

    users.push(req.body);
    write("users", users);

    if (req.body.avatar) req.body.avatar = `${HOST}/${req.body.avatar}`;
    delete req.body.password;

    res.status(200).json({
      status: 200,
      message: "success",
      token: jwt.sign({ userId: req.body.id }),
      data: req.body,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

export default { GET, LOGIN, REGISTER };
