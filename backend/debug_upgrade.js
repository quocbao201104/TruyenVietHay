const db = require('./config/db');
const levelHistoryService = require('./services/userLevelHistory.service');

async function debugUpgrade() {
    try {
        console.log('Testing autoUpgrade for user_id: 13...');
        const result = await levelHistoryService.autoUpgrade(13);
        console.log('✅ Upgrade SUCCESS:', result);
        process.exit(0);
    } catch (e) {
        console.error('❌ Upgrade FAILED with error:');
        console.error(e);
        process.exit(1);
    }
}

debugUpgrade();
