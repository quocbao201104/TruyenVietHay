const db = require("../config/db");
const UserReward = require("../models/userReward.model"); 
const UserCurrency = require("../models/userCurrency.model");
const UserLevelHistory = require("./userLevelHistory.service"); // For ensuring user level

/**
 * Grant a reward (Internal/Admin/System Trigger)
 */
const grantReward = async ({ userId, rewardId, source, metadata = {} }, connection = null) => {
    const conn = connection || await db.getConnection();
    const shouldRelease = !connection;

    try {
        if (!connection) await conn.beginTransaction();

        const [rewards] = await conn.execute("SELECT * FROM rewards WHERE reward_id = ?", [rewardId]);
        if (rewards.length === 0) throw new Error(`Reward ID ${rewardId} does not exist`);
        
        const reward = rewards[0];

        if (!reward.is_active) {
            console.log(`[Reward] Skipped disabled reward ${rewardId}`);
            if (!connection) await conn.commit();
            return null;
        }

        if (!reward.is_repeatable) {
            const [existing] = await conn.execute(
                "SELECT id FROM user_rewards WHERE user_id = ? AND reward_id = ? AND status != 'expired'",
                [userId, rewardId]
            );
            if (existing.length > 0) {
                console.log(`[GrantReward] User ${userId} already has reward ${rewardId}`);
                if (!connection) await conn.commit();
                return null; 
            }
        }

        let expiredAt = null;
        if (reward.duration_hours) {
            expiredAt = new Date(Date.now() + reward.duration_hours * 3600000);
        }

        // Default 'unlocked' so user knows they have it, unless pure currency/exp which we might auto-consume?
        // sticking to 'unlocked' for now.
        const initialStatus = 'unlocked'; 

        const [result] = await conn.execute(
            `INSERT INTO user_rewards 
            (user_id, reward_id, status, source, earned_at, metadata, expired_at) 
            VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
            [userId, rewardId, initialStatus, source, JSON.stringify(metadata), expiredAt]
        );

        const userRewardId = result.insertId;

        if (!connection) await conn.commit();
        return userRewardId;

    } catch (error) {
        if (!connection) await conn.rollback();
        throw error;
    } finally {
        if (shouldRelease) conn.release();
    }
};

/**
 * Buy a reward from Shop (User Action)
 */
const buyReward = async ({ userId, rewardId }) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get Reward & Price
        const [rewards] = await connection.execute("SELECT * FROM rewards WHERE reward_id = ?", [rewardId]);
        if (rewards.length === 0) throw new Error("Vật phẩm không tồn tại");
        const reward = rewards[0];

        // 2. Check Logic
        if (!reward.price || reward.price <= 0) {
             throw new Error("Vật phẩm này không bán/miễn phí, hãy nhận qua sự kiện hoặc cấp độ.");
        }
        
        // 3. Deduct Currency (Model throws if insufficient)
        await UserCurrency.deduct(userId, reward.price, connection);

        // 4. Grant Reward
        // Pass connection to share transaction
        const userRewardId = await grantReward({ 
            userId, 
            rewardId, 
            source: 'shop', // Special source
            metadata: { bought_price: reward.price } 
        }, connection);

        if (!userRewardId) {
             // grantReward returns null if already owned unique item
             throw new Error("Bạn đã sở hữu vật phẩm giới hạn này rồi.");
        }

        await connection.commit();
        return { success: true, message: "Mua thành công!", userRewardId };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Claim a Milestone/Free Reward (User Action)
 */
const claimMilestone = async ({ userId, rewardId }) => {
    // Note: This matches the "Catalog Claim" flow where user says "I want reward #5"
    // and we check if they qualify (Level).
    // This is distinct from "Claiming an Unlocked Instance" (:userRewardId/claim).
    // Let's call this `qualifyAndGrant` or `claimCatalogReward`?
    // User request: "points_required (min_level) mục đích là nếu đạt mốc thì nhận free"
    
    // NEW LOGIC: This creates a NEW user_reward instance if qualified.
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const [rewards] = await connection.execute("SELECT * FROM rewards WHERE reward_id = ?", [rewardId]);
        if (rewards.length === 0) throw new Error("Phần thưởng không tồn tại");
        const reward = rewards[0];

        // 1. Check Level Requirement
        if (reward.min_level > 0) {
             // Get current user level
             // Reuse ensureUserLevel logic or just read history?
             // userLevelHistory.service.ensureUserLevel returns current Level ID.
             const currentLevelId = await UserLevelHistory.ensureUserLevel(userId);
             
             // We need Level Number (or rank?), but level_id usually maps 1:1 or we need level definition.
             // Let's look up the level_id to get its order/magnitude?
             // Assuming level_id IS the level number for simplicity or we fetch `level_value`?
             // Usually level_id increments.
             
             // Actually, `user_levels` might have `level_value` or `required_points`.
             // If `min_level` refers to `level_id`, we compare IDs.
             if (currentLevelId < reward.min_level) {
                 throw new Error(`Bạn cần đạt cấp độ ${reward.min_level} để nhận thưởng.`);
             }
        } else {
             // If min_level is 0/null and price is 0... maybe it's free for everyone?
        }

        // 2. Grant
        const userRewardId = await grantReward({ 
            userId, 
            rewardId, 
            source: 'level', // It's a level/milestone reward
            metadata: { claimed_at_level: reward.min_level }
        }, connection);

         if (!userRewardId) throw new Error("Bạn đã nhận thưởng này rồi.");

        await connection.commit();
        return { success: true, userRewardId };

    } catch (error) {
         await connection.rollback();
         throw error;
    } finally {
         connection.release();
    }
};

/**
 * Claim/Activate an Instance (User has user_reward record)
 */
const claimRewardInstance = async ({ userId, userRewardId }) => {
     // Rename of previous 'claimReward'
      const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `SELECT ur.*, r.reward_type, r.metadata as reward_config 
             FROM user_rewards ur 
             JOIN rewards r ON ur.reward_id = r.reward_id 
             WHERE ur.id = ? AND ur.user_id = ? FOR UPDATE`,
            [userRewardId, userId]
        );

        if (rows.length === 0) throw new Error("Reward instance not found");
        const instance = rows[0];
        const config = typeof instance.reward_config === 'string' ? JSON.parse(instance.reward_config || '{}') : instance.reward_config;

        if (instance.status !== 'unlocked') {
            throw new Error(`Reward is ${instance.status}, cannot claim.`);
        }
        if (instance.expired_at && new Date(instance.expired_at) < new Date()) {
            throw new Error("Reward has expired.");
        }

        // Apply Instant Effects
        if (instance.reward_type === 'exp') {
            const amount = config.amount || config.exp || 0; // handle various formats
            // TODO: Call UserLevelService.addExp(userId, amount, connection);
        } else if (instance.reward_type === 'currency') {
             const amount = config.amount || config.currency || 0;
             await UserCurrency.add(userId, amount, connection);
        }

        await connection.execute(
            "UPDATE user_rewards SET status = 'claimed', claimed_at = NOW() WHERE id = ?",
            [userRewardId]
        );

        await connection.commit();
        return { success: true, type: instance.reward_type };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const useReward = async ({ userId, userRewardId }) => {
     // Same as before
      const connection = await db.getConnection();
    try {
        await connection.execute("UPDATE user_rewards SET status = 'used', used_at = NOW() WHERE id = ? AND user_id = ?", [userRewardId, userId]);
        return { success: true };
    } finally {
        connection.release();
    }
};

const getUserRewards = async (userId, filters = {}) => {
    // Same as before
    const { status, limit = 50, offset = 0 } = filters;
    const db = require("../config/db");
    let query = `
        SELECT ur.*, r.reward_name, r.description, r.icon, r.reward_type, r.rarity 
        FROM user_rewards ur
        JOIN rewards r ON ur.reward_id = r.reward_id
        WHERE ur.user_id = ?
    `;
    const params = [userId];
    if (status) { query += " AND ur.status = ?"; params.push(status); }
    query += " ORDER BY ur.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await db.query(query, params);
    return rows;
};

module.exports = {
    getUserRewards,
    grantReward,
    buyReward,
    claimMilestone, // New: Claim from Catalog via Level
    claimRewardInstance, // Renamed: Claim from Instance (Activate)
    useReward
};
