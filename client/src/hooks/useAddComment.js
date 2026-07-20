import { useCallback } from 'react';
import { commentService } from '../services/index.js';
import useMutation from './useMutation.js';

const useAddComment = (options = {}) => {
  const mutateFn = useCallback(
    ({ ticketId, payload }) => commentService.addComment(ticketId, payload),
    [],
  );

  return useMutation(mutateFn, {
    successMessage: 'Comment added',
    showErrorToast: false,
    ...options,
  });
};

export default useAddComment;
