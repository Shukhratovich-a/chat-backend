import jwt from "../utils/jwt.js";
import { ForbiddenError } from "../utils/errors.js";

export default (req, res, next) => {
  try {
    if (req.url == "/login" || req.url == "/register" || req.url == "/download")
      return next();

    const { token } = req.headers;

    if (!token) return next(new ForbiddenError(403, "token required"));

    const { userId } = jwt.verify(token);

    req.userId = userId;

    return next();
  } catch (error) {
    return next(new ForbiddenError(403, error.message));
  }
};
