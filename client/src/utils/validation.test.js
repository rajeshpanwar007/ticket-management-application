import { describe, expect, it } from 'vitest';
import {
  validateCommentForm,
  validateRequired,
  validateTicketForm,
} from './validation.js';

describe('validation utils', () => {
  it('validateRequired returns an error for empty values', () => {
    expect(validateRequired('', 'Title')).toBe('Title is required');
    expect(validateRequired(null, 'Title')).toBe('Title is required');
  });

  it('validateTicketForm requires title, description, and createdBy on create', () => {
    const errors = validateTicketForm(
      { title: '', description: '   ', createdBy: '' },
      'create',
    );

    expect(errors.title).toBe('Title is required');
    expect(errors.description).toBe('Description is required');
    expect(errors.createdBy).toBe('Created by is required');
  });

  it('validateCommentForm requires body and author', () => {
    const errors = validateCommentForm({ body: '', authorId: '' });

    expect(errors.body).toBe('Comment is required');
    expect(errors.authorId).toBe('Author is required');
  });
});
