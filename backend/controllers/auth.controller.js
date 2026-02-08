// backend/controllers/auth.controller.js
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    const {
        username,
        password,
        email,
        full_name,
        phone,
        role = "user",
        avatar,
    } = req.body;

    if (!username || !password || !email || !full_name || !phone) {
        return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
    }

    try {
        const existingUsers = await User.findByUsername(username);
        const emailExists = await User.findByEmail(email);

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Username đã tồn tại" });
        }
        if (emailExists.length > 0) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            username,
            password: hashedPassword,
            email,
            full_name,
            phone,
            role,
            avatar: avatar || "/uploads_img/avatar/default-avatar.jpg",
        };

        await User.create(newUser);
        res.status(201).json({ message: "Đăng ký thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi tạo user", error: err.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const results = await User.findByUsername(username);
        if (results.length === 0) {
            return res
                .status(401)
                .json({ message: "Tài khoản hoặc mật khẩu không đúng." });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res
                .status(401)
                .json({ message: "Tài khoản hoặc mật khẩu không đúng." });
        }

        if (user.status === "blocked") {
            const now = new Date();
            const banUntil = user.ban_until ? new Date(user.ban_until) : null;

            if (!banUntil || banUntil > now) {
                return res.status(403).json({
                    message: banUntil
                        ? `Tài khoản bị khóa đến ${banUntil.toLocaleString()}`
                        : `Tài khoản đã bị khóa vĩnh viễn`,
                });
            } else {
                await User.updateStatus(user.id, "active", null);
                user.status = "active";
                user.ban_until = null;
            }
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // GAMIFICATION TRIGGER: Daily Login
        try {
            const taskService = require("../services/task.service");
            // Auto-complete task "Đăng nhập hàng ngày"
            // Note: fire-and-forget, don't await blocking response
            taskService.completeTaskByName(user.id, "Đăng nhập hàng ngày").catch(err => {
                 console.error("Gamification Login Error:", err.message);
            });
        } catch (e) {
            console.error("Gamification Setup Error:", e.message);
        }

        res.json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi đăng nhập", error: err.message });
    }
};

exports.getMe = async (req, res) => {
    const userId = req.user.id;

    try {
        const results = await User.findById(userId);
        if (results.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const user = results[0];
        res.json({
            message: "Thông tin người dùng",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                gender: user.gender,
                created_at: user.created_at,
            },
        });
    } catch (err) {
        res.status(500).json({
            message: "Lỗi khi lấy thông tin người dùng",
            error: err.message,
        });
    }
};

exports.updateMe = async (req, res) => {
    const userId = req.user.id;
    const { full_name, email, phone, gender } = req.body;

    let avatarPathToDB;

    if (req.file) {
        avatarPathToDB = req.file.path;
    } else if (req.body.remove_avatar === "true" || req.body.avatar === "null" || req.body.avatar === "") {
        avatarPathToDB = null;
    } else {
        avatarPathToDB = undefined;
    }
    const updateData = {};

    if (avatarPathToDB !== undefined) {
        updateData.avatar = avatarPathToDB;
    }

    try {
        if (full_name !== undefined) updateData.full_name = full_name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (gender !== undefined) updateData.gender = gender;



        if (Object.keys(updateData).length === 0) {
            return res
                .status(200)
                .json({ message: "Không có thông tin nào được thay đổi để cập nhật." });
        }

        const affectedRows = await User.updateUser(userId, updateData);

        if (affectedRows === 0) {
            return res.status(200).json({
                message:
                    "Cập nhật thành công nhưng không có thay đổi nào được ghi nhận trong DB.",
            });
        }

        const updatedUserResults = await User.findById(userId);
        const updatedUser = updatedUserResults[0];

        // START GAMIFICATION TRIGGER
        try {
            const taskService = require("../services/task.service");
            // Auto-complete task "Cập nhật hồ sơ"
            // Note: We don't await strictly or we catch error so it doesn't fail the update if task fails
            await taskService.completeTaskByName(userId, "Cập nhật hồ sơ");
        } catch (taskErr) {
            console.error("Gamification Trigger Error:", taskErr.message);
        }
        // END GAMIFICATION TRIGGER

        res.json({ message: "Cập nhật thông tin thành công!", user: updatedUser });
    } catch (err) {
        res.status(500).json({
            message: "Lỗi server khi cập nhật thông tin",
            error: err.message,
        });
    }
};

exports.changePassword = async (req, res) => {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
        return res
            .status(400)
            .json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới." });
    }

    try {
        const results = await User.findById(userId);
        if (results.length === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(old_password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không đúng." });
        }

        const isNewPasswordSameAsOld = await bcrypt.compare(
            new_password,
            user.password
        );
        if (isNewPasswordSameAsOld) {
            return res
                .status(400)
                .json({ message: "Mật khẩu mới không được giống mật khẩu cũ." });
        }

        const hashed = await bcrypt.hash(new_password, 10);

        const updatedAffectedRows = await User.updatePassword(userId, hashed);

        if (updatedAffectedRows === 0) {
            return res.status(400).json({
                message:
                    "Không thể cập nhật mật khẩu. Có thể mật khẩu mới giống mật khẩu cũ.",
            });
        }

        res.json({ message: "Đổi mật khẩu thành công!" });
    } catch (err) {
        res.status(500).json({
            message: "Lỗi server khi đổi mật khẩu",
            error: err.message,
        });
    }
};