import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusBadge from './StatusBadge.jsx';

describe('StatusBadge', () => {
  it('renders the human-readable status label', () => {
    render(<StatusBadge status="in_progress" />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });
});

describe('StatusActions', () => {
  it('renders action buttons for allowed transitions and handles clicks', async () => {
    const user = userEvent.setup();
    const onTransition = vi.fn();
    const { default: StatusActions } = await import('./StatusActions.jsx');

    render(
      <StatusActions
        allowedNextStatuses={['in_progress', 'cancelled']}
        onTransition={onTransition}
      />,
    );

    await user.click(screen.getByRole('button', { name: /start progress/i }));
    expect(onTransition).toHaveBeenCalledWith('in_progress');
  });

  it('shows a terminal message when no transitions are available', async () => {
    const { default: StatusActions } = await import('./StatusActions.jsx');

    render(<StatusActions allowedNextStatuses={[]} onTransition={vi.fn()} />);

    expect(screen.getByText(/no further status changes available/i)).toBeInTheDocument();
  });
});
