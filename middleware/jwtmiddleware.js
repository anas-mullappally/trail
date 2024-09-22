const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt; // Assuming you're using cookies for token storage

  if (!token) {
    return res.render("user/login-register");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.render("user/login-register");
  }
};

module.exports = verifyToken;

 