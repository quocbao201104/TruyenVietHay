/**
 * Script test luồng Gamification: Lên cấp → Hộp thư → Nhận quà → Túi đồ
 * Chạy: cd backend && node scripts/test_levelup_rewards.js
 */
require("dotenv").config();
const db = require("../config/db");
const { triggerLevelUpRewards, claimReward } = require("../models/reward.model");
const InventoryModel = require("../models/inventory.model");

// ─── Cấu hình test ─────────────────────────────────────────
const TEST_USER_ID = 13;   // ← Đổi thành user_id thực có trong DB của bạn
const TEST_LEVEL   = 1;    // ← Cấp độ muốn test (phải có trong level_rewards)
// ───────────────────────────────────────────────────────────

const log  = (msg)       => console.log(`  ✅ ${msg}`);
const warn = (msg)       => console.log(`  ⚠️  ${msg}`);
const err  = (label, e)  => console.error(`  ❌ ${label}:`, e.message);
const hr   = ()          => console.log("\n" + "─".repeat(60));

// ──────────────────────────────────────────────────────────
async function step1_checkConfig() {
  hr();
  console.log(`[BƯỚC 1] Kiểm tra cấu hình level_rewards cho cấp ${TEST_LEVEL}`);

  const [rows] = await db.query(
    `SELECT lr.level_id, lr.reward_id, lr.quantity, r.reward_type, r.reward_name, r.metadata
     FROM level_rewards lr
     JOIN rewards r ON lr.reward_id = r.reward_id
     WHERE lr.level_id = ?`,
    [TEST_LEVEL]
  );

  if (rows.length === 0) {
    warn(`Không có phần thưởng nào được cấu hình cho cấp ${TEST_LEVEL}.`);
    warn("Hãy INSERT vào level_rewards trước rồi chạy lại script.");
    return false;
  }

  log(`Tìm thấy ${rows.length} phần thưởng cho cấp ${TEST_LEVEL}:`);
  rows.forEach(r => {
    console.log(`     • reward_id=${r.reward_id} | type=${r.reward_type} | qty=${r.quantity} | name=${r.reward_name}`);
  });
  return true;
}

// ──────────────────────────────────────────────────────────
async function step2_triggerLevelUp() {
  hr();
  console.log(`[BƯỚC 2] Gọi triggerLevelUpRewards(userId=${TEST_USER_ID}, level=${TEST_LEVEL})`);

  try {
    const gifts = await triggerLevelUpRewards(TEST_USER_ID, TEST_LEVEL);
    if (gifts.length === 0) {
      warn("triggerLevelUpRewards trả về mảng rỗng (không có quà).");
      return [];
    }
    log(`Đã gửi ${gifts.length} quà vào hộp thư:`);
    gifts.forEach(g => console.log(`     • reward_id=${g.reward_id} | type=${g.reward_type} | qty=${g.quantity}`));
    return gifts;
  } catch (e) {
    err("triggerLevelUpRewards", e);
    return [];
  }
}

// ──────────────────────────────────────────────────────────
async function step3_checkInbox() {
  hr();
  console.log(`[BƯỚC 3] Kiểm tra Hộp Thư (user_rewards) của user ${TEST_USER_ID}`);

  const [rows] = await db.query(
    `SELECT ur.id, ur.reward_id, ur.status, ur.source, ur.quantity, r.reward_type, r.reward_name
     FROM user_rewards ur
     JOIN rewards r ON ur.reward_id = r.reward_id
     WHERE ur.user_id = ? AND ur.status = 'unlocked'
     ORDER BY ur.id DESC LIMIT 20`,
    [TEST_USER_ID]
  );

  if (rows.length === 0) {
    warn("Không có quà unlocked trong hộp thư. Kiểm tra lại Bước 2.");
    return [];
  }

  log(`Hộp thư có ${rows.length} món quà đang chờ nhận:`);
  rows.forEach(r => {
    console.log(`     • id=${r.id} | reward=${r.reward_name} (${r.reward_type}) | qty=${r.quantity} | source=${r.source}`);
  });
  return rows;
}

// ──────────────────────────────────────────────────────────
async function step4_claimAllPending(pendingRewards) {
  hr();
  console.log(`[BƯỚC 4] Nhận từng quà trong Hộp Thư (claimReward)`);

  if (pendingRewards.length === 0) {
    warn("Không có quà để nhận, bỏ qua bước này.");
    return;
  }

  for (const reward of pendingRewards) {
    try {
      const result = await claimReward(TEST_USER_ID, reward.id);
      log(`Nhận thành công: id=${reward.id} → ${result.message}`);
    } catch (e) {
      err(`claimReward(id=${reward.id})`, e);
    }
  }
}

// ──────────────────────────────────────────────────────────
async function step5_checkInventory() {
  hr();
  console.log(`[BƯỚC 5] Kiểm tra Túi Đồ (user_inventory) của user ${TEST_USER_ID}`);

  try {
    const badges = await InventoryModel.getUserBadges(TEST_USER_ID);
    if (badges.length === 0) {
      warn("Túi đồ không có badge nào. Phần thưởng loại badge chưa được nhận hoặc không có badge trong lần test này.");
    } else {
      log(`Tìm thấy ${badges.length} badge trong túi đồ:`);
      badges.forEach(b => {
        console.log(`     • reward_id=${b.reward_id} | ${b.badge_name} | equipped=${b.is_equipped}`);
      });
    }
  } catch (e) {
    err("getUserBadges", e);
  }

  // Kiểm tra thêm user_points (linh_thach, tu_vi)
  const [[points]] = await db.query(
    `SELECT * FROM user_points WHERE user_id = ?`,
    [TEST_USER_ID]
  ).catch(() => [[null]]);

  if (points) {
    const cols = Object.entries(points).filter(([k]) => !['id','user_id','created_at','updated_at','expiry_date'].includes(k));
    log(`Chỉ số user_points hiện tại: ${cols.map(([k,v]) => `${k}=${v}`).join(' | ')}`);
  } else {
    warn("User chưa có bản ghi trong user_points.");
  }
}

// ──────────────────────────────────────────────────────────
async function step6_testEquipBadge() {
  hr();
  console.log(`[BƯỚC 6] Test đeo huy hiệu (equipBadge)`);

  // Lấy badge đầu tiên trong túi đồ để test đeo
  const badges = await InventoryModel.getUserBadges(TEST_USER_ID);
  if (badges.length === 0) {
    warn("Không có badge nào để test đeo, bỏ qua.");
    return;
  }

  const targetBadge = badges[0];
  console.log(`  → Thử đeo badge: reward_id=${targetBadge.reward_id} (${targetBadge.badge_name})`);

  try {
    const result = await InventoryModel.equipBadge(TEST_USER_ID, targetBadge.reward_id);
    log(`Đeo thành công: reward_id=${result.reward_id}`);

    // Xác nhận lại DB
    const equipped = await InventoryModel.getUserBadges(TEST_USER_ID);
    const equippedBadge = equipped.find(b => b.is_equipped === 1);
    if (equippedBadge) {
      log(`DB xác nhận đang đeo: ${equippedBadge.badge_name} (reward_id=${equippedBadge.reward_id})`);
    }
  } catch (e) {
    err("equipBadge", e);
  }
}

// ──────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║     TEST GAMIFICATION: LÊN CẤP → HỘP THƯ → NHẬN QUÀ   ║");
  console.log(`║     User: ${TEST_USER_ID.toString().padEnd(5)} | Cấp test: ${TEST_LEVEL.toString().padEnd(20)}  ║`);
  console.log("╚══════════════════════════════════════════════════════════╝");

  try {
    const hasConfig = await step1_checkConfig();
    if (!hasConfig) {
      process.exit(0);
    }

    await step2_triggerLevelUp();
    const pendingRewards = await step3_checkInbox();
    await step4_claimAllPending(pendingRewards);
    await step5_checkInventory();
    await step6_testEquipBadge();

    hr();
    console.log("\n🎉 Test hoàn tất!\n");
  } catch (e) {
    console.error("\n💥 Lỗi không mong muốn:", e.message);
    console.error(e.stack);
  } finally {
    await db.end().catch(() => {});
    process.exit(0);
  }
}

main();
