require('dotenv').config();
const db = require('./config/db');

async function checkTask() {
    try {
        const [rows] = await db.query("SELECT * FROM tasks WHERE task_name = 'Đăng nhập hàng ngày'");
        console.log("Task found:", rows);
        if (rows.length === 0) {
            console.log("Task NOT found. Creating...");
            await db.query(`INSERT INTO tasks (task_name, description, task_type, points_awarded, level_id) VALUES ('Đăng nhập hàng ngày', 'Đăng nhập vào hệ thống mỗi ngày', 'basic', 10, 1)`);
            console.log("Task created.");
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkTask();
