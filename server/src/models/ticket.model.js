import mongoose from 'mongoose';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '../constants/ticket.constants.js';

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [1, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: TICKET_STATUSES,
        message: '{VALUE} is not a valid status',
      },
      default: 'open',
    },
    priority: {
      type: String,
      enum: {
        values: TICKET_PRIORITIES,
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ticketSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'ticketId',
});

ticketSchema.index({ status: 1 }, { name: 'status_index' });
ticketSchema.index({ createdBy: 1 }, { name: 'createdBy_index' });
ticketSchema.index({ assignedTo: 1 }, { sparse: true, name: 'assignedTo_index' });
ticketSchema.index({ createdAt: -1 }, { name: 'createdAt_index' });
ticketSchema.index(
  { title: 'text', description: 'text' },
  { name: 'ticket_text_search', default_language: 'english' },
);

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
