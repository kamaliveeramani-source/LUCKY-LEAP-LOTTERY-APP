const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided"
      });
    }

    const parts = authHeader.split(" ");
    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("[AUTH] JWT_SECRET not configured");
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("[AUTH] JWT verification failed:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid Token"
    });
  }
};

module.exports = verifyToken;