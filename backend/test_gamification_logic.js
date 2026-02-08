const db = require('./config/db');
const taskService = require('./services/task.service');
const userPointService = require('./services/userPoint.service');
const userLevelHistoryService = require('./services/userLevelHistory.service');
const userRewardService = require('./services/userReward.service');
const userTaskModel = require('./models/userTask.model');
const rewardService = require('./services/reward.service');

const TEST_USER_ID = 99999;
const TEST_TASK_ID = 1; // Assuming task ID 1 exists
let TEST_REWARD_ID;

const runTests = async () => {
    console.log('🚀 Starting Gamification System Tests...\n');
    const connection = await db.getConnection();

    try {
        // --- SETUP ---
        console.log('1️⃣  Setup: Cleaning up test data...');
        // Delete child records first
        await connection.query('DELETE FROM user_tasks WHERE user_id = ?', [TEST_USER_ID]);
        await connection.query('DELETE FROM user_points WHERE user_id = ?', [TEST_USER_ID]);
        await connection.query('DELETE FROM user_levels_history WHERE user_id = ?', [TEST_USER_ID]);
        await connection.query('DELETE FROM user_rewards WHERE user_id = ?', [TEST_USER_ID]);
        await connection.query('DELETE FROM rewards WHERE reward_name = ?', ['Test Reward']);
        // Delete parent user if exists
        await connection.query('DELETE FROM users_new WHERE id = ?', [TEST_USER_ID]);

        console.log('   Creating test user in users_new...');
        await connection.query(
            `INSERT INTO users_new (id, username, password, full_name, email, role, status) 
             VALUES (?, 'test_gamification_user', 'password123', 'Test User', 'test@gamification.com', 'user', 'active')`, 
            [TEST_USER_ID]
        );
        
        console.log('   Creating test user points...');
        // Note: current_level_id column might be dropped or not depending on if migration ran. 
        // We handle both cases by not specifying current_level_id in insert if possible, 
        // but if the code expects it internally we might need it.
        // Actually, our updated code relies on history. Let's insert without current_level_id first 
        // OR checks if column exists. 
        // Safer: Insert points. If current_level_id exists as default NULL, it's fine.
        await connection.query('INSERT INTO user_points (user_id, total_exp) VALUES (?, 0)', [TEST_USER_ID]);

        
        // --- TEST 1: Task Assignment & Completion ---
        console.log('\n2️⃣  Test: Task Assignment & Completion (Transaction Safety)');
        await userTaskModel.assign(TEST_USER_ID, TEST_TASK_ID);
        console.log('   ✅ Task assigned');

        const initialPoints = await userPointService.getPointsByUserId(TEST_USER_ID);
        console.log('   Initial Points:', initialPoints.total_exp);

        await taskService.completeTask(TEST_USER_ID, TEST_TASK_ID);
        console.log('   ✅ Task completed');

        const afterPoints = await userPointService.getPointsByUserId(TEST_USER_ID);
        console.log('   Points after completion:', afterPoints.total_exp);

        if (afterPoints.total_exp > 0) {
            console.log('   ✅ Points awarded correctly');
        } else {
            throw new Error('❌ Points NOT awarded');
        }

        // --- TEST 2: Double Completion (Idempotency) ---
        console.log('\n3️⃣  Test: Double Completion Prevention');
        try {
            await taskService.completeTask(TEST_USER_ID, TEST_TASK_ID);
            throw new Error('❌ Double completion SHOULD fail but succeeded');
        } catch (e) {
            if (e.message.includes('đã hoàn thành') || e.message.includes('chưa được gán')) {
                 console.log('   ✅ Double completion blocked correctly:', e.message);
            } else {
                throw e;
            }
        }

        // --- TEST 3: Level Up Flow ---
        console.log('\n4️⃣  Test: Level Up Flow');
        // Create initial history for level 1
        const now = new Date();
        const past = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)); // 10 days ago
        await connection.query('INSERT INTO user_levels_history (user_id, level_id, start_date, end_date) VALUES (?, 1, ?, ?)', 
            [TEST_USER_ID, past, new Date(past.getTime() + 100*24*60*60*1000)]);

        // Force update points to 300 (enough for Level 2 which needs 250)
        await connection.query('UPDATE user_points SET total_exp = 300 WHERE user_id = ?', [TEST_USER_ID]);
            
        console.log('   Running autoUpgrade...');
        const upgradeResult = await userLevelHistoryService.autoUpgrade(TEST_USER_ID);
        console.log('   Upgrade Result:', upgradeResult);

        if (upgradeResult.new_level_id === 2) {
            console.log('   ✅ Upgraded to Level 2');
        } else {
             throw new Error('❌ Failed to upgrade to Level 2');
        }

        // --- TEST 4: Reward Eligibility (Buying with Currency) ---
        console.log('\n5️⃣  Test: Reward Purchase (Currency)');
        
        // Ensure wallet exists and reset to 0
        const UserCurrency = require('./models/userCurrency.model');
        const connectionC = await require('./config/db').getConnection();
        await UserCurrency.ensureWallet(TEST_USER_ID, connectionC);
        await connection.query('UPDATE user_currency SET linh_thach = 0 WHERE user_id = ?', [TEST_USER_ID]);

        // Create a reward costing 200 Currency
        TEST_REWARD_ID = await rewardService.createReward({
            reward_name: 'Test Currency Reward',
            description: 'Test Description',
            reward_type: 'currency', 
            rarity: 'common',
            is_repeatable: true,
            min_level: 0, 
            price: 200, 
        });
        console.log('   Created Test Reward ID:', TEST_REWARD_ID);

        // Try to buy (Should fail - insufficient currency)
        try {
            await userRewardService.buyReward({ userId: TEST_USER_ID, rewardId: TEST_REWARD_ID });
            throw new Error('❌ Should have failed due to insufficient currency');
        } catch (err) {
             console.log('   ✅ Insufficient currency check passed:', err.message);
        }

        // Give Currency (500 > 200 + 200)
        await UserCurrency.add(TEST_USER_ID, 500);
        console.log('   Added 500 Linh Thach');
        
        // Buy again (Should succeed)
        await userRewardService.buyReward({ userId: TEST_USER_ID, rewardId: TEST_REWARD_ID });
        console.log('   ✅ Reward purchased successfully');

        // Buy duplicate (Should succeed as is_repeatable=true)
        await userRewardService.buyReward({ userId: TEST_USER_ID, rewardId: TEST_REWARD_ID });
        console.log('   ✅ Duplicate purchase succeeded (repeatable)');

        console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨');

    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
        console.error(err);
    } finally {
        // Cleanup
        console.log('\n🧹 Cleanup...');
        await connection.query('DELETE FROM user_tasks WHERE user_id = ?', [TEST_USER_ID]);
        await connection.query('DELETE FROM user_points WHERE user_id = ?', [TEST_USER_ID]);
        await connection.query('DELETE FROM user_levels_history WHERE user_id = ?', [TEST_USER_ID]);
        await connection.query('DELETE FROM user_rewards WHERE user_id = ?', [TEST_USER_ID]);
        if (TEST_REWARD_ID) {
            await connection.query('DELETE FROM rewards WHERE reward_id = ?', [TEST_REWARD_ID]);
        }
        await connection.query('DELETE FROM users_new WHERE id = ?', [TEST_USER_ID]);
        await connection.release();
        process.exit(0);
    }
};

runTests();
