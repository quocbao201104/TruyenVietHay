const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller"); 
const upload = require("../middleware/upload_img"); 
const { authenticateToken } = require("../middleware/auth"); 
// const {
// validateRegister,
// validateLogin,
// validateUpdateUser,
// } = require("../validators/auth.validator"); // Giữ nguyên comment phòng cần dùng

router.post("/dang-ky", authController.register); 
router.post("/dang-nhap", authController.login); 
router.post("/google", authController.googleLogin);
router.get("/me", authenticateToken, authController.getMe); 

router.put("change-password", authenticateToken, authController.changePassword); 

router.put(
    "/me",
    authenticateToken,
    upload.single("avatar"),
    authController.updateMe 
);

// XÓA CÁC ROUTE DƯỚI ĐÂY VÌ CHÚNG THUỘC VỀ PHẦN QUẢN LÝ NGƯỜI DÙNG CỦA ADMIN (sẽ ở trong user.routes.js)
// router.get(
//     "/users/:id",
//     authenticateToken,
//     authorizeRoles("admin"),
//     authController.getUserById
// );
// router.get(
//     "/all-users",
//     authenticateToken,
//     authorizeRoles("admin"),
//     authController.getAllUsers
// );
// router.put(
//     "/ban-user", // Cần điều chỉnh lại endpoint cho rõ ràng hơn (ví dụ /users/:id/ban)
//     authenticateToken,
//     authorizeRoles("admin"),
//     banUserUntil.banUser // Cái này cũng sẽ được chuyển vào user.controller.js và user.routes.js
// );
// router.delete(
//     "/users/:id",
//     authenticateToken,
//     authorizeRoles("admin"),
//     authController.deleteUser
// );

module.exports = router;