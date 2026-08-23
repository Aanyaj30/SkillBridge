import jwt from "jsonwebtoken";

// This runs BEFORE any route that needs the user to be logged in.
// It checks for a valid token in the request header and attaches the
// decoded user info (id + role) to req.user so controllers can use it.
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
