const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Safe logging: log presence of header, not content
    if (!authHeader) {
      console.log("[AUTH] No Authorization header");
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided"
      });
    }

    console.log("[AUTH] Authorization header present:", authHeader.substring(0, 10) + "...");

    const parts = authHeader.split(" ");
    const token = parts[1];

    if (!token) {
      console.log("[AUTH] No token after Bearer");
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided"
      });
    }

    // Log JWT_SECRET presence only
    if (!process.env.JWT_SECRET) {
      console.error("[AUTH] JWT_SECRET not configured");
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    console.log("[AUTH] Attempting JWT verification with secret present");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[AUTH] JWT verified successfully, userId:", decoded.userId);
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