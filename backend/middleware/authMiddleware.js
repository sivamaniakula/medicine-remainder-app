const jwt = require("jsonwebtoken");
const User = require("../models/User");

// This middleware protects routes that require login.
// How it works:
// 1. The client sends the JWT in the "Authorization" header as: Bearer <token>
// 2. We verify the token using our JWT_SECRET
// 3. If valid, we look up the user and attach it to req.user
// 4. The next route handler can then access req.user
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1]; // "Bearer <token>" -> take the token part

      // jwt.verify throws an error if the token is invalid or expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // decoded.id was set when we originally signed the token at login/register
      // .select("-password") excludes the hashed password from the returned user
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      next(); // token valid, user found -> proceed to the actual route
    } catch (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
