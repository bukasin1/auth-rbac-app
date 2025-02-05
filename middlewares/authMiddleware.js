const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: "Invalid token" });

  // confirm token is of a valid user
  const userExists = await User.findById(decoded.id);
  if (!userExists) return res.status(401).json({ message: "Invalid user token" });

  req.user = userExists;
  next();
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access forbidden: insufficient permissions" });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
