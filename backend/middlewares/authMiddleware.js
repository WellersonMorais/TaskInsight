const jwt = require("jsonwebtoken");
const { secret: jwtSecret } = require("../config/jwt");

module.exports = (req, res, next) => {
  const token = req.headers["x-auth-token"] || req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  try {
    const payload = jwt.verify(token.replace("Bearer ", ""), jwtSecret);
    req.userId = payload.userId;
    req.isAdmin = payload.isAdmin || false;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};
