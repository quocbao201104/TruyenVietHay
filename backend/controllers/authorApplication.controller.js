// backend/controllers/authorApplication.controller.js
const AuthorApplicationModel = require("../models/authorApplication.model");
const UserModel = require("../models/user.model");
const logger = require("../utils/logger");

const authorApplicationController = {
    // User submits an application
    applyAuthor: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { pen_name, bio, experience } = req.body;

            if (!pen_name) {
                return res.status(400).json({ message: "Bút danh là bắt buộc." });
            }

            // Check for existing pending application
            const pendingApplications = await AuthorApplicationModel.findPendingByUserId(userId);
            if (pendingApplications.length > 0) {
                return res.status(400).json({ message: "Bạn đã có một đơn đăng ký đang chờ xử lý." });
            }

            const applicationData = {
                user_id: userId,
                pen_name,
                bio,
                experience
            };

            const applicationId = await AuthorApplicationModel.create(applicationData);
            
            logger.info(`User ${userId} submitted author application ${applicationId}`);
            res.status(201).json({
                success: true,
                message: "Đơn đăng ký của bạn đã được gửi thành công và đang chờ duyệt.",
                applicationId
            });
        } catch (error) {
            logger.error(`Error in applyAuthor: ${error.message}`);
            next(error);
        }
    },

    // Get the status of the current user's application
    getApplicationStatus: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const application = await AuthorApplicationModel.findLatestByUserId(userId);
            
            res.json({
                success: true,
                application: application || null
            });
        } catch (error) {
            logger.error(`Error in getApplicationStatus: ${error.message}`);
            next(error);
        }
    },

    // Admin lists all applications
    getApplications: async (req, res, next) => {
        try {
            const { status } = req.query;
            const applications = await AuthorApplicationModel.findAll(status);
            res.json({ success: true, applications });
        } catch (error) {
            logger.error(`Error in getApplications: ${error.message}`);
            next(error);
        }
    },

    // Admin approves an application
    approveApplication: async (req, res, next) => {
        try {
            const { id } = req.body; // Application ID
            if (!id) return res.status(400).json({ message: "Thiếu ID đơn đăng ký." });

            const application = await AuthorApplicationModel.findById(id);
            if (!application) return res.status(404).json({ message: "Không tìm thấy đơn đăng ký." });

            if (application.status !== 'pending') {
                return res.status(400).json({ message: "Đơn đăng ký này đã được xử lý." });
            }

            // 1. Update application status
            await AuthorApplicationModel.updateStatus(id, 'approved', 'Đã được Admin duyệt.');

            // 2. Update user role
            await UserModel.updateUserRole(application.user_id, 'author');

            logger.info(`Admin ${req.user.id} approved author application ${id} for user ${application.user_id}`);
            res.json({ success: true, message: "Đơn đăng ký đã được duyệt. Vai trò người dùng đã được cập nhật thành 'tác giả'." });
        } catch (error) {
            logger.error(`Error in approveApplication: ${error.message}`);
            next(error);
        }
    },

    // Admin rejects an application
    rejectApplication: async (req, res, next) => {
        try {
            const { id, admin_note } = req.body;
            if (!id) return res.status(400).json({ message: "Thiếu ID đơn đăng ký." });

            const application = await AuthorApplicationModel.findById(id);
            if (!application) return res.status(404).json({ message: "Không tìm thấy đơn đăng ký." });

            if (application.status !== 'pending') {
                return res.status(400).json({ message: "Đơn đăng ký này đã được xử lý." });
            }

            await AuthorApplicationModel.updateStatus(id, 'rejected', admin_note || "Bị Admin từ chối.");

            logger.info(`Admin ${req.user.id} rejected author application ${id} for user ${application.user_id}`);
            res.json({ success: true, message: "Đơn đăng ký đã bị từ chối." });
        } catch (error) {
            logger.error(`Error in rejectApplication: ${error.message}`);
            next(error);
        }
    }
};

module.exports = authorApplicationController;
