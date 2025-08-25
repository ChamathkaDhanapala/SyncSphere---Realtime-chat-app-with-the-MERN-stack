import jwt from "jsonwebtoken";

export function generateToken(userId, secret, expiresIn = "7d") {
  return jwt.sign({ id: userId }, secret, { expiresIn });
}
