import connectDB from '../config/db.js';

// TODO: Implement seed script — see database/seed-data/

const seed = async () => {
  try {
    await connectDB();
    console.log('[INFO] Seed script not yet implemented.');
    // TODO: Drop collections, insert users, tickets, comments
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
