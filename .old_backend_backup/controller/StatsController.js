import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import client from "../config/redisClient.js";
// Controller function for retrieving transactions
export const index = async (req, res) => {
  if(client.isReady){
    const cachedData = await client.get("stats");
    if (cachedData) {
      return res.json({ data: JSON.parse(cachedData) });
    }
  }
  const userCounts= await User.countDocuments({ categories: { $exists: true } });
  const transactionCounts = await Transaction.countDocuments();
  const data = {
      userCounts: userCounts,
      transactionCounts: transactionCounts,
  };
    
  await client.set("stats", JSON.stringify(data));
  await client.expire('stats', 6000);
  res.json({ data: data });
};

