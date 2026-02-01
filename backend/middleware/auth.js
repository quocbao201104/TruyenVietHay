const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ!" });

    console.log("JWT payload:", user); 
    req.user = user;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    console.log("User role:", userRole, "Allowed roles:", allowedRoles); 

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập chức năng này!" });
    }
    next();
  };
}



function optionalAuthenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (!err) {
            req.user = user;
        }
        next();
    });
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuthenticateToken
};
