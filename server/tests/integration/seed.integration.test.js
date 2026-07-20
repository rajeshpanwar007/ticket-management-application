import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Comment, Ticket, User } from '../../src/models/index.js';
import { SEED_COMMENTS, SEED_TICKETS, SEED_USERS } from '../../src/scripts/seed/seedData.js';
import { seedDatabase } from '../../src/scripts/seed/seedDatabase.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30000);

describe('seedDatabase', () => {
  it('seeds users, tickets, and comments with valid relationships', async () => {
    const result = await seedDatabase({ clearExisting: true });

    expect(result.summary).toEqual({
      users: SEED_USERS.length,
      tickets: SEED_TICKETS.length,
      comments: SEED_COMMENTS.length,
    });

    expect(await User.countDocuments()).toBe(SEED_USERS.length);
    expect(await Ticket.countDocuments()).toBe(SEED_TICKETS.length);
    expect(await Comment.countDocuments()).toBe(SEED_COMMENTS.length);

    const loginTicket = result.ticketsByKey.t1;
    const agent = result.usersByKey.agent;
    const customer = result.usersByKey.customer;

    expect(loginTicket.createdBy.toString()).toBe(customer._id.toString());
    expect(loginTicket.assignedTo.toString()).toBe(agent._id.toString());

    const ticketComments = await Comment.find({ ticketId: loginTicket._id }).sort({ createdAt: 1 });
    expect(ticketComments).toHaveLength(3);
    expect(ticketComments[0].authorId.toString()).toBe(agent._id.toString());
    expect(ticketComments[2].authorId.toString()).toBe(customer._id.toString());
  });

  it('can be re-run safely by clearing existing collections first', async () => {
    await seedDatabase({ clearExisting: true });
    await seedDatabase({ clearExisting: true });

    expect(await User.countDocuments()).toBe(SEED_USERS.length);
    expect(await Ticket.countDocuments()).toBe(SEED_TICKETS.length);
    expect(await Comment.countDocuments()).toBe(SEED_COMMENTS.length);
  });

  it('stores hashed passwords for demo users', async () => {
    await seedDatabase({ clearExisting: true });

    const admin = await User.findOne({ email: 'admin@demo.com' }).select('+password');
    expect(admin.password).toBeDefined();
    expect(admin.password).not.toBe('Demo@1234');
    expect(admin.password.startsWith('$2')).toBe(true);
  });
});
