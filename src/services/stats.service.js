import Transaction from "../../models/Transaction.js";
import User from "../../models/User.js";
import client from "../../config/redisClient.js";

/**
 * Stats Service
 * Handles statistics and analytics
 */

class StatsService {
    /**
     * Get global statistics (cached)
     * @returns {Object} Global statistics
     */
    async getGlobalStats() {
        // Try to get from cache
        if (client.isReady) {
            const cachedData = await client.get("stats");
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        // Calculate stats
        const userCounts = await User.countDocuments({ categories: { $exists: true } });
        const transactionCounts = await Transaction.countDocuments();

        const data = {
            userCounts: userCounts,
            transactionCounts: transactionCounts,
        };

        // Cache the data
        if (client.isReady) {
            await client.set("stats", JSON.stringify(data));
            await client.expire("stats", 6000); // 100 minutes
        }

        return data;
    }
}

export default new StatsService();
