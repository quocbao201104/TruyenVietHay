const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 40, // Increased from 10 to 40 for higher concurrency
  queueLimit: 0,       // Unlimited queue updates to prevent dropping requests during huge spikes
  acquireTimeout: 10000, // Increased to 10s to handle momentary DB load
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: false // Bắt buộc cho Aiven
  },
  timezone: '+07:00' // Sử dụng múi giờ Việt Nam
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Kết nối DB thất bại: ", err);
    return;
  }
  console.log("✅ Kết nối DB Aiven thành công!");
  connection.release();
});

module.exports = pool.promise();