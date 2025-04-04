const jwt = require("jsonwebtoken");

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      if (!token) {
        return res.status(403).json({ message: "Access Denied: No Token Provided" });
      }

      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      req.user = decoded; // Attach decoded info (id, role) to `req.user`

      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
      }

      next();
    } catch (error) {
      return res.status(403).json({ message: "Access Denied: Invalid or Expired Token" });
    }
  };
};

module.exports = roleMiddleware;
