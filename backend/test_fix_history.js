const db = require('./config/db');
const UserLevelHistory = require('./models/userLevelHistory.model');

async function test() {
    try {
        console.log('Testing UserLevelHistory.getByUserId joined with user_levels...');
        // Find a user with some history
        const [users] = await db.query('SELECT user_id FROM user_levels_history LIMIT 1');
        if (users.length === 0) {
            console.log('No user history found to test.');
            process.exit(0);
        }
        
        const userId = users[0].user_id;
        const history = await UserLevelHistory.getByUserId(userId, 1, 0);
        
        console.log('Result:', JSON.stringify(history[0], null, 2));
        
        if (history[0] && history[0].name) {
            console.log('✅ SUCCESS: Level name found:', history[0].name);
        } else {
            console.error('❌ FAILURE: Level name missing from result');
        }
        
        process.exit(0);
    } catch (e) {
        console.error('Test failed with error:', e);
        process.exit(1);
    }
}

test();
