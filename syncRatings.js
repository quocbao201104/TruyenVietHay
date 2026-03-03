const db = require('./backend/config/db');

async function syncRatingCounts() {
  try {
    const query = `
      UPDATE truyen_new t
      SET 
        rating = COALESCE((
          SELECT AVG(rating)
          FROM ratings r
          WHERE r.truyen_id = t.id
        ), 0),
        rating_count = (
          SELECT COUNT(*)
          FROM ratings r
          WHERE r.truyen_id = t.id
        )
    `;
    const [result] = await db.query(query);
    console.log(`Updated rating and rating_count for stories. Affected rows: ${result.affectedRows || result.changedRows || 'Unknown'}`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating rating data:", error);
    process.exit(1);
  }
}

syncRatingCounts();
