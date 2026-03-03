const db = require('./backend/config/db');

async function syncFollowCounts() {
  try {
    const query = `
      UPDATE truyen_new t
      SET luot_theo_doi = (
        SELECT COUNT(*)
        FROM theo_doi td
        WHERE td.truyen_id = t.id
      )
    `;
    const [result] = await db.query(query);
    console.log(`Updated luot_theo_doi cho các truyện. Số lượng ảnh hưởng: ${result.affectedRows || result.changedRows || 'Không rõ'}`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating luot_theo_doi:", error);
    process.exit(1);
  }
}

syncFollowCounts();
