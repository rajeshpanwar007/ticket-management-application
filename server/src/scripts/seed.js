import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import logger from '../utils/logger.js';
import { DEMO_PASSWORD } from './seed/seedData.js';
import { getSeedSummary, seedDatabase } from './seed/seedDatabase.js';

const seed = async () => {
  try {
    await connectDB();

    const result = await seedDatabase({ clearExisting: true });
    const summary = getSeedSummary(result);

    logger.info('Database seeded successfully', summary);
    console.log('[INFO] Seed complete:');
    console.log(`  users:    ${summary.users}`);
    console.log(`  tickets:  ${summary.tickets}`);
    console.log(`  comments: ${summary.comments}`);
    console.log('  tickets by status:', summary.ticketsByStatus);
    console.log('[INFO] Demo credentials (development only):');
    console.log(`  admin@demo.com / ${DEMO_PASSWORD}`);
    console.log(`  manager@demo.com / ${DEMO_PASSWORD}`);
    console.log(`  agent@demo.com / ${DEMO_PASSWORD}`);
    console.log(`  customer@demo.com / ${DEMO_PASSWORD}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    logger.error('Seed failed', { message: err.message, stack: err.stack });
    console.error('[ERROR] Seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

seed();
