export const USER_PUBLIC_FIELDS = 'name email role';

export const USER_POPULATE = {
  path: 'createdBy assignedTo',
  select: USER_PUBLIC_FIELDS,
};

export const COMMENT_AUTHOR_POPULATE = {
  path: 'authorId',
  select: USER_PUBLIC_FIELDS,
};

export const COMMENT_POPULATE = {
  path: 'comments',
  options: { sort: { createdAt: 1 } },
  populate: {
    path: 'authorId',
    select: USER_PUBLIC_FIELDS,
  },
};
