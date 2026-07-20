import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, Ticket, Comment } from '../../src/models/index.js';
import { TICKET_PRIORITIES, TICKET_STATUSES, USER_ROLES } from '../../src/constants/ticket.constants.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Ticket.deleteMany({}),
    Comment.deleteMany({}),
  ]);
});

describe('User model', () => {
  it('creates a valid user with defaults', async () => {
    const user = await User.create({
      name: 'Alice Customer',
      email: 'customer@demo.com',
    });

    expect(user.role).toBe('customer');
    expect(user.email).toBe('customer@demo.com');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('lowercases and trims email', async () => {
    const user = await User.create({
      name: 'Bob Agent',
      email: '  AGENT@DEMO.COM  ',
    });

    expect(user.email).toBe('agent@demo.com');
  });

  it('rejects invalid email', async () => {
    await expect(
      User.create({ name: 'Test', email: 'not-an-email' }),
    ).rejects.toThrow(/valid email/);
  });

  it('rejects duplicate email', async () => {
    await User.create({ name: 'User One', email: 'dup@demo.com' });
    await expect(
      User.create({ name: 'User Two', email: 'dup@demo.com' }),
    ).rejects.toThrow();
  });

  it('rejects invalid role enum', async () => {
    await expect(
      User.create({ name: 'Test', email: 'test@demo.com', role: 'invalid' }),
    ).rejects.toThrow(/valid role/);
  });

  it('excludes password from JSON output', async () => {
    const user = await User.create({
      name: 'Secure User',
      email: 'secure@demo.com',
      password: 'password123',
    });

    const json = user.toJSON();
    expect(json.password).toBeUndefined();
  });

  it.each(USER_ROLES)('accepts role %s', async (role) => {
    const user = await User.create({
      name: `${role} user`,
      email: `${role}@demo.com`,
      role,
    });
    expect(user.role).toBe(role);
  });
});

describe('Ticket model', () => {
  let user;

  beforeEach(async () => {
    user = await User.create({ name: 'Creator', email: 'creator@demo.com' });
  });

  it('creates a ticket with default status and priority', async () => {
    const ticket = await Ticket.create({
      title: 'Cannot login',
      description: 'Getting 401 error',
      createdBy: user._id,
    });

    expect(ticket.status).toBe('open');
    expect(ticket.priority).toBe('medium');
    expect(ticket.assignedTo).toBeNull();
    expect(ticket.createdAt).toBeInstanceOf(Date);
  });

  it('accepts optional assignee', async () => {
    const assignee = await User.create({ name: 'Agent', email: 'agent@demo.com', role: 'agent' });

    const ticket = await Ticket.create({
      title: 'Assigned ticket',
      description: 'Needs help',
      createdBy: user._id,
      assignedTo: assignee._id,
    });

    expect(ticket.assignedTo.toString()).toBe(assignee._id.toString());
  });

  it('rejects invalid status enum', async () => {
    await expect(
      Ticket.create({
        title: 'Bad status',
        description: 'Test',
        createdBy: user._id,
        status: 'invalid',
      }),
    ).rejects.toThrow(/valid status/);
  });

  it('rejects invalid priority enum', async () => {
    await expect(
      Ticket.create({
        title: 'Bad priority',
        description: 'Test',
        createdBy: user._id,
        priority: 'urgent',
      }),
    ).rejects.toThrow(/valid priority/);
  });

  it('requires title and description', async () => {
    await expect(
      Ticket.create({ createdBy: user._id }),
    ).rejects.toThrow();
  });

  it.each(TICKET_STATUSES)('accepts status %s', async (status) => {
    const ticket = await Ticket.create({
      title: `Ticket ${status}`,
      description: 'Test',
      createdBy: user._id,
      status,
    });
    expect(ticket.status).toBe(status);
  });

  it.each(TICKET_PRIORITIES)('accepts priority %s', async (priority) => {
    const ticket = await Ticket.create({
      title: 'Priority test',
      description: 'Test',
      createdBy: user._id,
      priority,
    });
    expect(ticket.priority).toBe(priority);
  });
});

describe('Comment model', () => {
  let user;
  let ticket;

  beforeEach(async () => {
    user = await User.create({ name: 'Author', email: 'author@demo.com' });
    ticket = await Ticket.create({
      title: 'Comment test ticket',
      description: 'Test',
      createdBy: user._id,
    });
  });

  it('creates a comment with createdAt only', async () => {
    const comment = await Comment.create({
      ticketId: ticket._id,
      authorId: user._id,
      body: 'First comment',
    });

    expect(comment.createdAt).toBeInstanceOf(Date);
    expect(comment.updatedAt).toBeUndefined();
  });

  it('requires body, ticketId, and authorId', async () => {
    await expect(Comment.create({})).rejects.toThrow();
  });

  it('rejects empty body after trim', async () => {
    await expect(
      Comment.create({
        ticketId: ticket._id,
        authorId: user._id,
        body: '   ',
      }),
    ).rejects.toThrow();
  });

  it('populates ticket comments virtual', async () => {
    await Comment.create({
      ticketId: ticket._id,
      authorId: user._id,
      body: 'Thread comment',
    });

    const populated = await Ticket.findById(ticket._id).populate('comments');
    expect(populated.comments).toHaveLength(1);
    expect(populated.comments[0].body).toBe('Thread comment');
  });
});
