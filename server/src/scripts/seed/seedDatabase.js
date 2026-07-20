import bcrypt from 'bcryptjs';
import { Comment, Ticket, User } from '../../models/index.js';
import {
  DEMO_PASSWORD,
  SEED_COMMENTS,
  SEED_TICKETS,
  SEED_USERS,
} from './seedData.js';

const BCRYPT_ROUNDS = 10;

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

const mapByKey = (records) =>
  Object.fromEntries(records.map((record) => [record.key, record]));

export const clearSeedCollections = async () => {
  await Promise.all([
    Comment.deleteMany({}),
    Ticket.deleteMany({}),
    User.deleteMany({}),
  ]);
};

export const seedUsers = async () => {
  const password = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);

  const users = await User.insertMany(
    SEED_USERS.map(({ key, name, email, role }) => ({
      name,
      email,
      role,
      password,
    })),
  );

  const usersByKey = {};
  SEED_USERS.forEach((seedUser, index) => {
    usersByKey[seedUser.key] = users[index];
  });

  return { users, usersByKey };
};

export const seedTickets = async (usersByKey) => {
  const now = new Date();

  const tickets = await Ticket.insertMany(
    SEED_TICKETS.map(
      ({
        title,
        description,
        status,
        priority,
        createdByKey,
        assignedToKey,
        createdAtOffsetDays,
      }) => ({
        title,
        description,
        status,
        priority,
        createdBy: usersByKey[createdByKey]._id,
        assignedTo: assignedToKey ? usersByKey[assignedToKey]._id : null,
        createdAt: addDays(now, createdAtOffsetDays),
        updatedAt: addDays(now, createdAtOffsetDays),
      }),
    ),
  );

  const ticketsByKey = {};
  SEED_TICKETS.forEach((seedTicket, index) => {
    ticketsByKey[seedTicket.key] = tickets[index];
  });

  return { tickets, ticketsByKey };
};

export const seedComments = async (usersByKey, ticketsByKey) => {
  const comments = await Comment.insertMany(
    SEED_COMMENTS.map(({ ticketKey, authorKey, body, createdAtOffsetMinutes, createdAtOffsetDays }) => {
      const ticket = ticketsByKey[ticketKey];
      const createdAt =
        createdAtOffsetDays !== undefined
          ? addDays(ticket.createdAt, createdAtOffsetDays)
          : addMinutes(ticket.createdAt, createdAtOffsetMinutes);

      return {
        ticketId: ticket._id,
        authorId: usersByKey[authorKey]._id,
        body,
        createdAt,
      };
    }),
  );

  const commentsByKey = {};
  SEED_COMMENTS.forEach((seedComment, index) => {
    commentsByKey[seedComment.key] = comments[index];
  });

  return { comments, commentsByKey };
};

export const seedDatabase = async ({ clearExisting = true } = {}) => {
  if (clearExisting) {
    await clearSeedCollections();
  }

  const { users, usersByKey } = await seedUsers();
  const { tickets, ticketsByKey } = await seedTickets(usersByKey);
  const { comments, commentsByKey } = await seedComments(usersByKey, ticketsByKey);

  return {
    users,
    tickets,
    comments,
    usersByKey,
    ticketsByKey,
    commentsByKey,
    summary: {
      users: users.length,
      tickets: tickets.length,
      comments: comments.length,
    },
  };
};

export const getSeedSummary = (result) => ({
  users: result.summary.users,
  tickets: result.summary.tickets,
  comments: result.summary.comments,
  ticketsByStatus: result.tickets.reduce((counts, ticket) => {
    counts[ticket.status] = (counts[ticket.status] ?? 0) + 1;
    return counts;
  }, {}),
});

export { mapByKey };
