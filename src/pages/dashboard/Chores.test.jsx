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
        getRooms: vi.fn().mockResolvedValue([]),
    }
}));

import Chores from './Chores';
import { API } from '../../api';

function renderChores() {
    return render(
        <MemoryRouter>
            <Chores />
        </MemoryRouter>
    );
}

// A chore that was last done 30 days ago with Weekly frequency → overdue
function makeChore(overrides = {}) {
    const lastDone = new Date();
    lastDone.setDate(lastDone.getDate() - 30);
    return {
        id: 'c1',
        name: 'Vacuum living room',
        frequency: 'Weekly',
        room: 'Living Room',
        lastDone,
        ...overrides,
    };
}

describe('Chores', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        API.getChores.mockResolvedValue([]);
    });

    describe('loading state', () => {
        it('renders skeleton cards while chores are loading', () => {
            // Don't resolve yet — keep the promise pending
            API.getChores.mockReturnValue(new Promise(() => {}));
            renderChores();
            const skeletons = document.querySelectorAll('.chore-card.skeleton');
            expect(skeletons.length).toBe(3);
        });
    });

    describe('empty state', () => {
        it('renders empty state when chores array is empty', async () => {
            API.getChores.mockResolvedValue([]);
            renderChores();
            await waitFor(() => {
                expect(screen.getByText(/no chores yet/i)).toBeInTheDocument();
            });
        });

        it('shows add-one link inside empty state', async () => {
            API.getChores.mockResolvedValue([]);
            renderChores();
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /add one/i })).toBeInTheDocument();
            });
        });

        it('shows filter-specific message when non-All filter has no results', async () => {
            API.getChores.mockResolvedValue([]);
            renderChores();
            await waitFor(() => screen.getByText(/no chores yet/i));
            fireEvent.click(screen.getByRole('button', { name: 'Overdue' }));
            expect(screen.getByText(/no overdue chores/i)).toBeInTheDocument();
        });
    });

    describe('loaded chores', () => {
        it('renders chore cards when chores are loaded', async () => {
            API.getChores.mockResolvedValue([
                makeChore({ id: 'c1', name: 'Vacuum living room' }),
                makeChore({ id: 'c2', name: 'Clean bathroom' }),
            ]);
            renderChores();
            await waitFor(() => {
                expect(screen.getByText('Vacuum living room')).toBeInTheDocument();
                expect(screen.getByText('Clean bathroom')).toBeInTheDocument();
            });
        });

        it('renders chore name and frequency badge for each chore', async () => {
            API.getChores.mockResolvedValue([
                makeChore({ id: 'c1', name: 'Mop floors', frequency: 'Monthly' }),
            ]);
            renderChores();
            await waitFor(() => {
                expect(screen.getByText('Mop floors')).toBeInTheDocument();
                expect(screen.getByText('Monthly')).toBeInTheDocument();
            });
        });

        it('renders three chores when getChores returns three items', async () => {
            API.getChores.mockResolvedValue([
                makeChore({ id: 'c1', name: 'Task A' }),
                makeChore({ id: 'c2', name: 'Task B' }),
                makeChore({ id: 'c3', name: 'Task C' }),
            ]);
            renderChores();
            await waitFor(() => {
                expect(screen.getByText('Task A')).toBeInTheDocument();
                expect(screen.getByText('Task B')).toBeInTheDocument();
                expect(screen.getByText('Task C')).toBeInTheDocument();
            });
        });
    });

    describe('filter tabs', () => {
        it('renders all four filter tabs', async () => {
            renderChores();
            await waitFor(() => screen.getByText(/no chores yet/i));
            expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Overdue' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Due today' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Upcoming' })).toBeInTheDocument();
        });

        it('shows As-needed chore under All tab', async () => {
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Clean gutters', frequency: 'As needed' },
            ]);
            renderChores();
            await waitFor(() => {
                expect(screen.getByText('Clean gutters')).toBeInTheDocument();
            });
        });

        it('hides As-needed chore under Overdue tab', async () => {
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Clean gutters', frequency: 'As needed' },
            ]);
            renderChores();
            await waitFor(() => screen.getByText('Clean gutters'));
            fireEvent.click(screen.getByRole('button', { name: 'Overdue' }));
            expect(screen.queryByText('Clean gutters')).not.toBeInTheDocument();
        });

        it('hides As-needed chore under Due today tab', async () => {
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Clean gutters', frequency: 'As needed' },
            ]);
            renderChores();
            await waitFor(() => screen.getByText('Clean gutters'));
            fireEvent.click(screen.getByRole('button', { name: 'Due today' }));
            expect(screen.queryByText('Clean gutters')).not.toBeInTheDocument();
        });

        it('hides As-needed chore under Upcoming tab', async () => {
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Clean gutters', frequency: 'As needed' },
            ]);
            renderChores();
            await waitFor(() => screen.getByText('Clean gutters'));
            fireEvent.click(screen.getByRole('button', { name: 'Upcoming' }));
            expect(screen.queryByText('Clean gutters')).not.toBeInTheDocument();
        });
    });

    describe('edit modal', () => {
        it('opens edit modal when a chore card is clicked', async () => {
            API.getChores.mockResolvedValue([makeChore({ id: 'c1', name: 'Vacuum living room' })]);
            renderChores();
            await waitFor(() => screen.getByText('Vacuum living room'));
            fireEvent.click(screen.getByText('Vacuum living room'));
            expect(screen.getByRole('heading', { name: 'Edit Chore' })).toBeInTheDocument();
        });

        it('shows completion count in detail strip', async () => {
            API.getChores.mockResolvedValue([makeChore({ id: 'c1', name: 'Vacuum', completionCount: 5 })]);
            renderChores();
            await waitFor(() => screen.getByText('Vacuum'));
            fireEvent.click(screen.getByText('Vacuum'));
            expect(screen.getByText('5 times')).toBeInTheDocument();
        });

        it('shows "—" for completion count when not set', async () => {
            API.getChores.mockResolvedValue([makeChore({ id: 'c1', name: 'Dust', completionCount: undefined })]);
            renderChores();
            await waitFor(() => screen.getByText('Dust'));
            fireEvent.click(screen.getByText('Dust'));
            expect(screen.getByText('—')).toBeInTheDocument();
        });

        it('calls API.updateChore when edit form is saved', async () => {
            API.getChores.mockResolvedValue([makeChore({ id: 'c1', name: 'Old Name' })]);
            renderChores();
            await waitFor(() => screen.getByText('Old Name'));
            fireEvent.click(screen.getByText('Old Name'));
            fireEvent.change(screen.getByDisplayValue('Old Name'), { target: { value: 'New Name' } });
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));
            await waitFor(() => {
                expect(API.updateChore).toHaveBeenCalledWith('test-uid', 'c1', expect.objectContaining({ name: 'New Name' }), null);
            });
        });

        it('closes edit modal when Cancel is clicked', async () => {
            API.getChores.mockResolvedValue([makeChore({ id: 'c1', name: 'Vacuum living room' })]);
            renderChores();
            await waitFor(() => screen.getByText('Vacuum living room'));
            fireEvent.click(screen.getByText('Vacuum living room'));
            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
            expect(screen.queryByRole('heading', { name: 'Edit Chore' })).not.toBeInTheDocument();
        });
    });

    describe('sort order', () => {
        it('overdue chores appear before upcoming chores in All tab', async () => {
            const recent = new Date();
            recent.setDate(recent.getDate() - 1); // done yesterday, Weekly → due in 6 days
            const old = new Date();
            old.setDate(old.getDate() - 30); // done 30 days ago, Weekly → overdue
            API.getChores.mockResolvedValue([
                makeChore({ id: 'c1', name: 'Upcoming Task', lastDone: recent }),
                makeChore({ id: 'c2', name: 'Overdue Task', lastDone: old }),
            ]);
            renderChores();
            await waitFor(() => screen.getByText('Upcoming Task'));
            const names = document.querySelectorAll('.chore-name');
            expect(names[0].textContent).toBe('Overdue Task');
            expect(names[1].textContent).toBe('Upcoming Task');
        });
    });

    describe('add modal', () => {
        it('add modal is hidden initially', async () => {
            renderChores();
            await waitFor(() => screen.getByText(/no chores yet/i));
            expect(screen.queryByText('Add Chore', { selector: 'h3' })).not.toBeInTheDocument();
        });

        it('opens add modal when "+ Add Chore" button is clicked', async () => {
            renderChores();
            await waitFor(() => screen.getByText(/no chores yet/i));
            fireEvent.click(screen.getByRole('button', { name: /\+ add chore/i }));
            expect(screen.getByRole('heading', { name: 'Add Chore' })).toBeInTheDocument();
        });

        it('"As needed" option exists in the frequency select', async () => {
            renderChores();
            await waitFor(() => screen.getByText(/no chores yet/i));
            fireEvent.click(screen.getByRole('button', { name: /\+ add chore/i }));
            // The modal has two selects (Frequency + Room); labels lack htmlFor
            // Find the select that contains frequency values (Daily, Weekly, etc.)
            const selects = screen.getAllByRole('combobox');
            const freqSelect = selects.find(sel =>
                Array.from(sel.querySelectorAll('option')).some(o => o.textContent === 'Weekly')
            );
            expect(freqSelect).toBeDefined();
            const options = Array.from(freqSelect.querySelectorAll('option')).map(o => o.textContent);
            expect(options).toContain('As needed');
        });

        it('closes add modal when Cancel is clicked', async () => {
            renderChores();
            await waitFor(() => screen.getByText(/no chores yet/i));
            fireEvent.click(screen.getByRole('button', { name: /\+ add chore/i }));
            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
            expect(screen.queryByRole('heading', { name: 'Add Chore' })).not.toBeInTheDocument();
        });

        it('calls API.addChore when form is submitted with a name', async () => {
            renderChores();
            await waitFor(() => screen.getByText(/no chores yet/i));
            fireEvent.click(screen.getByRole('button', { name: /\+ add chore/i }));
            fireEvent.change(screen.getByPlaceholderText(/vacuum living room/i), { target: { value: 'New Task' } });
            fireEvent.click(screen.getByRole('button', { name: /^add chore$/i }));
            await waitFor(() => {
                expect(API.addChore).toHaveBeenCalledWith('test-uid', expect.objectContaining({ name: 'New Task' }), null);
            });
        });
    });
});
