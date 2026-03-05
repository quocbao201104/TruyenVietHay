const mysql = require("mysql2/promise");
require("dotenv").config({ path: "./backend/.env" });

async function verify() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("--- 1. Testing user_levels lifespan data ---");
    const [levels] = await pool.query("SELECT level_id, name, lifespan, required_points FROM user_levels ORDER BY required_points ASC");
    console.table(levels);

    console.log("\n--- 2. Testing SUM(lifespan) logic for target level 'Kim Đan' (required_points=2000) ---");
    // Lv1: 120, Lv2: 200, Lv3: 500 => Total 820
    const [sumRows] = await pool.query(
        "SELECT SUM(COALESCE(lifespan, 0)) as total_lifespan FROM user_levels WHERE required_points <= 2000"
    );
    console.log("Total lifespan for Kim Đan:", sumRows[0].total_lifespan);

    console.log("\n--- 3. Testing SUM(lifespan) logic for target level 'Nguyên Anh' (required_points=3000) ---");
    // Lv1: 120, Lv2: 200, Lv3: 500, Lv4: 2000 => Total 2820
    const [sumRows2] = await pool.query(
        "SELECT SUM(COALESCE(lifespan, 0)) as total_lifespan FROM user_levels WHERE required_points <= 3000"
    );
    console.log("Total lifespan for Nguyên Anh:", sumRows2[0].total_lifespan);

  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await pool.end();
  }
}

verify();
