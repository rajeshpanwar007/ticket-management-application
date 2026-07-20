const ACTIVE_FILTER = { deletedAt: null };

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const escapeTextSearch = (value) => value.replace(/["\\-]/g, (match) => `\\${match}`);

const isTextSearchQuery = (value) => /^[\w\s]+$/.test(value);

export const buildTicketListFilter = ({ search, status } = {}) => {
  const filter = { ...ACTIVE_FILTER };

  if (status) {
    filter.status = status;
  }

  const trimmedSearch = search?.trim();
  if (!trimmedSearch) {
    return { filter, useTextSearch: false };
  }

  if (isTextSearchQuery(trimmedSearch)) {
    filter.$text = { $search: escapeTextSearch(trimmedSearch) };
    return { filter, useTextSearch: true };
  }

  const pattern = new RegExp(escapeRegex(trimmedSearch), 'i');
  filter.$or = [{ title: pattern }, { description: pattern }];
  return { filter, useTextSearch: false };
};

export const buildTicketListSort = (useTextSearch) =>
  useTextSearch
    ? { score: { $meta: 'textScore' }, createdAt: -1 }
    : { createdAt: -1 };
