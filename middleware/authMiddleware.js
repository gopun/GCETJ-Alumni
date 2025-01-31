const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = decoded;
    next();
  });
};

// Middleware to verify session
const authenticateSession = (req, res, next) => {
  console.error("\n req.session..", req.session);

  if (req.session && req.session.user) {
    return next();
  }
  res
    .status(401)
    .json({ message: "Unauthorized. Please log in.", session: req.session });
};

// Combined middleware for session and JWT
const combinedAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }

  authenticateJWT(req, res, next);
};

module.exports = { authenticateJWT, authenticateSession, combinedAuth };
