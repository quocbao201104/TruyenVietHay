const db = require("./config/db");
require("dotenv").config();

const seeds = [
  // Level 1 Tasks (Basic)
  {
    task_name: "Đọc chương đầu tiên",
    description: "Đọc 1 chương truyện bất kỳ để làm quen.",
    task_type: "basic",
    points_awarded: 10,
    level_id: 1
  },
  {
    task_name: "Cập nhật hồ sơ",
    description: "Điền đầy đủ thông tin cá nhân của bạn.",
    task_type: "basic",
    points_awarded: 20,
    level_id: 1
  },
  
  // Level 2 Tasks
  {
    task_name: "Bình luận dạo",
    description: "Viết 3 bình luận xây dựng.",
    task_type: "basic",
    points_awarded: 15,
    level_id: 2
  },
  
  // Level 3 Tasks
  {
    task_name: "Fan cứng",
    description: "Đọc liên tục trong 3 ngày.",
    task_type: "advanced",
    points_awarded: 50,
    level_id: 3
  },

  // Level 4 Tasks
  {
    task_name: "Đại gia donate",
    description: "Ủng hộ truyện bất kỳ.",
    task_type: "advanced",
    points_awarded: 100,
    level_id: 4
  },
  
  // Generic tasks for higher levels
  { task_name: "Siêu cấp đọc giả", description: "Đọc 50 chương truyện.", task_type: "advanced", points_awarded: 100, level_id: 5 },
  { task_name: "Thần tượng giới trẻ", description: "Được 10 người theo dõi.", task_type: "advanced", points_awarded: 150, level_id: 6 },
  { task_name: "Bình luận viên vàng", description: "Viết 10 bình luận chất lượng.", task_type: "advanced", points_awarded: 200, level_id: 7 },
  { task_name: "Đại thần", description: "Đứng top 1 bảng xếp hạng nào đó.", task_type: "advanced", points_awarded: 300, level_id: 8 },
  { task_name: "Huyền thoại", description: "Online 24h liên tục.", task_type: "advanced", points_awarded: 500, level_id: 9 },
  { task_name: "Chúa tể web truyện", description: "Không làm gì cũng có điểm.", task_type: "advanced", points_awarded: 1000, level_id: 10 }
];

async function seed() {
  try {
    console.log("Seeding tasks...");
    
    // Check if tasks exist to avoid duplicates (optional, but good)
    // For simplicity, we just insert. Or delete all first? 
    // Let's delete valid test tasks first to clean up.
    // await db.execute("DELETE FROM tasks WHERE task_name IN (?, ?, ?, ?, ?)", seeds.map(s => s.task_name));

    for (const task of seeds) {
      // Check existence
      const [exists] = await db.execute("SELECT task_id FROM tasks WHERE task_name = ? AND level_id = ?", [task.task_name, task.level_id]);
      
      if (exists.length === 0) {
          await db.execute(
            "INSERT INTO tasks (task_name, description, task_type, points_awarded, level_id) VALUES (?, ?, ?, ?, ?)",
            [task.task_name, task.description, task.task_type, task.points_awarded, task.level_id]
          );
          console.log(`Inserted: ${task.task_name}`);
      } else {
          console.log(`Skipped (Exists): ${task.task_name}`);
      }
    }
    
    console.log("Seeding complete!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    process.exit();
  }
}

seed();
