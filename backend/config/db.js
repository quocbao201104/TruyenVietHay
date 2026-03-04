const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 25, // Reduced from 40 to 25 to stay within Aiven limits
  queueLimit: 0,
  acquireTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // Sync with server expectations
  dateStrings: true, // Prevent involuntary date conversions
  ssl: {
    rejectUnauthorized: false
  },
  timezone: 'Z'
});

// Error handling to prevent ECONNRESET from crashing app
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
    console.log('Reconnecting to database...');
  }
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