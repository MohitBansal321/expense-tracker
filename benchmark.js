import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import RecurringTransactionService from './src/services/recurring-transaction.service.js';
import RecurringTransaction from './src/models/RecurringTransaction.js';
import Transaction from './src/models/Transaction.js';

async function runBenchmark() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log("Connected to in-memory MongoDB");

  const userId = new mongoose.Types.ObjectId();
  const categoryId = new mongoose.Types.ObjectId();

  // Create 1000 due recurring transactions
  const now = new Date();
  const past = new Date(now.getTime() - 100000);

  const recurringDocs = [];
  for (let i = 0; i < 1000; i++) {
    recurringDocs.push({
      user_id: userId,
      amount: 10 + i,
      description: `Test ${i}`,
      type: 'expense',
      category_id: categoryId,
      frequency: 'monthly',
      startDate: past,
      nextExecution: past,
      isActive: true
    });
  }

  await RecurringTransaction.insertMany(recurringDocs);
  console.log(`Inserted ${recurringDocs.length} recurring transactions`);

  // Run the processDueTransactions and measure time
  const start = performance.now();
  await RecurringTransactionService.processDueTransactions();
  const end = performance.now();

  console.log(`processDueTransactions took: ${end - start} ms`);

  const transactionsCount = await Transaction.countDocuments();
  console.log(`Created ${transactionsCount} transactions`);

  await mongoose.disconnect();
  await mongoServer.stop();
}

runBenchmark().catch(console.error);
