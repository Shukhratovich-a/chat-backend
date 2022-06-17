import jwt from "jsonwebtoken";

const secret = "xn-9t4b11yi5a";

export default {
  sign: (payload) => jwt.sign(payload, secret),
  verify: (token) => jwt.verify(token, secret),
};
