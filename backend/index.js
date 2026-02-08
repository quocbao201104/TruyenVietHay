    const express = require("express");
    const methodOverride = require("method-override");
    const app = express();
    const port = process.env.PORT || 3000;
    require("dotenv").config();
    require("./config/db"); // Keep for side-effect (DB connection logging) but remove unused 'db' variable
    const path = require("path");

    const cors = require("cors");
    const helmet = require("helmet");
    const compression = require("compression");
    const xssClean = require("xss-clean");
    const rateLimit = require("express-rate-limit");

    const logger = require("./utils/logger");
    const errorMiddleware = require("./middleware/errorHandler");

    // Security middlewares
    app.use(
        cors({
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization", "Content-Length", "X-Requested-With"],
            credentials: true,
            optionsSuccessStatus: 200,
        })
    );
    app.use(helmet());
    app.use(compression());
    app.use(xssClean());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.options("*", cors());


    // Healthcheck route - Lightweight and no DB query
    app.get("/healthcheck", (req, res) => {
        res.status(200).send("OK");
    });

    // Serving static files (Simplified: Global CORS handles headers)
    const publicPath = path.resolve(__dirname, "public");
    app.use(express.static(publicPath));

    // Rate Limiters
    // General limiter
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 500,
    });
    app.use(limiter);

    app.use((req, res, next) => {
        logger.info(`${req.method} ${req.originalUrl}`);
        next();
    });

    // Routes
    app.use("/api/auth", require("./routes/auth.routes"));
    app.use("/api/truyen", require("./routes/story.routes"));
    app.use("/api/chuong", require("./routes/chapter.routes"));
    app.use("/api/upload-truyen", require("./routes/up_story.routes"));
    app.use("/api/theloai", require("./routes/category.routes"));
    app.use("/api/history", require("./routes/history.routes"));
    app.use("/api/comments", require("./routes/comment.routes"));
    app.use("/api/follow", require("./routes/follow.routes"));
    app.use("/api/like", require("./routes/like.routes"));
    app.use("/api/user", require("./routes/profile.routes"));
    app.use("/api/admin/users", require("./routes/user.routes"));
    app.use("/api/levels", require("./routes/userLevel.routes"));
    app.use("/api/levels/history", require("./routes/levelHistory.routes"));
    app.use("/api/points", require("./routes/points.routes"));
    app.use("/api/tasks", require("./routes/task.routes"));
    app.use("/api/rewards", require("./routes/reward.routes"));
    app.use("/api/user-rewards", require("./routes/userReward.routes"));
    app.use("/api/ratings", require("./routes/rating.routes"));
    app.use("/api/notifications", require("./routes/notification.routes"));
    app.use("/api/currency", require("./routes/currency.routes")); // New Currency Route
    app.use("/api/admin", require("./routes/admin.cache.routes")); // Cache monitoring endpoints

    app.get("/", (req, res) => {
        res.send("Server is awake!");
    });

    // 404 Handler
    app.use((req, res) => {
        logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
        res.status(404).json({ message: "Tuyến đường không tồn tại" });
    });

    // Error Middleware
    app.use(errorMiddleware);

    app.listen(port, () => {
        logger.info(`Server is running on http://localhost:${port}`);
    });