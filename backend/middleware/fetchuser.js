const jwt = require("jsonwebtoken");

module.exports = function fetchuser(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ error: "Please sign in to continue." });
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: "JWT_SECRET is not configured." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload.user;
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
};
