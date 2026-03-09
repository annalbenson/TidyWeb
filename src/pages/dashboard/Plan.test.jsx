import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../AuthContext', () => ({ useAuth: () => ({ uid: 'test-uid' }) }));
vi.mock('../../contexts/HouseholdContext', () => ({ useHousehold: () => ({ householdId: null, members: {}, loading: false }) }));

vi.mock('../../api', () => ({
    API: {
        getChores: vi.fn().mockResolvedValue([]),
        addChore: vi.fn().mockResolvedValue({ id: 'new-id' }),
        updateChore: vi.fn().mockResolvedValue(undefined),
        deleteChore: vi.fn().mockResolvedValue(undefined),
        completeChore: vi.fn().mockResolvedValue(undefined),
        scheduleChore: vi.fn().mockResolvedValue(undefined),
        unscheduleChore: vi.fn().mockResolvedValue(undefined),
        getProfile: vi.fn().mockResolvedValue({ cleaningStyle: 'Weekly sweep', homeType: 'House' }),
        saveProfile: vi.fn().mockResolvedValue(undefined),
    }
}));

import Plan from './Plan';
import { API } from '../../api';

function renderPlan() {
    return render(
        <MemoryRouter>
            <Plan />
        </MemoryRouter>
    );
}

describe('Plan', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        API.getChores.mockResolvedValue([]);
        localStorage.clear();
    });

    describe('loading state', () => {
        it('renders loading skeleton when chores is null (still loading)', () => {
            API.getChores.mockReturnValue(new Promise(() => {}));
            renderPlan();
            // The skeleton still renders the unscheduled strip with THIS WEEK label
            expect(screen.getByText('THIS WEEK')).toBeInTheDocument();
        });

        it('renders 7 skeleton day columns while loading', () => {
            API.getChores.mockReturnValue(new Promise(() => {}));
            renderPlan();
            const dayColumns = document.querySelectorAll('.day-column');
            expect(dayColumns).toHaveLength(7);
        });
    });

    describe('loaded state', () => {
        it('renders the unscheduled strip after chores load', async () => {
            renderPlan();
            await waitFor(() => {
                expect(screen.getByText('THIS WEEK')).toBeInTheDocument();
            });
        });

        it('shows "All chores are scheduled" when there are no unscheduled chores', async () => {
            renderPlan();
            await waitFor(() => {
                expect(screen.getByText('All chores are scheduled')).toBeInTheDocument();
            });
        });

        it('renders the "Sun – Sat" toggle button', async () => {
            renderPlan();
            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Sun – Sat' })).toBeInTheDocument();
            });
        });

        it('renders the "Today →" toggle button', async () => {
            renderPlan();
            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Today →' })).toBeInTheDocument();
            });
        });

        it('renders 7 day columns after chores load', async () => {
            renderPlan();
            await waitFor(() => screen.getByText('All chores are scheduled'));
            const dayColumns = document.querySelectorAll('.day-column');
            expect(dayColumns).toHaveLength(7);
        });

        it('renders the board grid', async () => {
            renderPlan();
            await waitFor(() => screen.getByText('All chores are scheduled'));
            expect(document.querySelector('.board-grid')).toBeInTheDocument();
        });
    });

    describe('view mode toggle', () => {
        it('"Sun – Sat" button is active by default', async () => {
            renderPlan();
            await waitFor(() => screen.getByRole('button', { name: 'Sun – Sat' }));
            expect(screen.getByRole('button', { name: 'Sun – Sat' })).toHaveClass('active');
        });

        it('switches to rolling view when "Today →" is clicked', async () => {
            renderPlan();
            await waitFor(() => screen.getByRole('button', { name: 'Today →' }));
            fireEvent.click(screen.getByRole('button', { name: 'Today →' }));
            expect(screen.getByRole('button', { name: 'Today →' })).toHaveClass('active');
            expect(screen.getByRole('button', { name: 'Sun – Sat' })).not.toHaveClass('active');
        });

        it('persists view mode preference to localStorage', async () => {
            renderPlan();
            await waitFor(() => screen.getByRole('button', { name: 'Today →' }));
            fireEvent.click(screen.getByRole('button', { name: 'Today →' }));
            expect(localStorage.getItem('tidy:plan-view')).toBe('rolling');
        });
    });

    describe('unscheduled chips', () => {
        it('renders unscheduled chore chip when a chore has no scheduledDate', async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Vacuum floors', frequency: 'Weekly', lastDone: yesterday, scheduledDate: null },
            ]);
            renderPlan();
            await waitFor(() => {
                expect(screen.getByText('Vacuum floors')).toBeInTheDocument();
            });
        });
    });
});
