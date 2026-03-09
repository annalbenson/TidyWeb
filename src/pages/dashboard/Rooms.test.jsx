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

// Rooms.jsx imports ROOM_NAMES from Chores.jsx — those are real exports, no mock needed
import Rooms from './Rooms';
import { API } from '../../api';

function renderRooms() {
    return render(
        <MemoryRouter>
            <Rooms />
        </MemoryRouter>
    );
}

describe('Rooms', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        API.getChores.mockResolvedValue([]);
    });

    describe('page structure', () => {
        it('renders the "Rooms" page heading', async () => {
            renderRooms();
            expect(screen.getByRole('heading', { name: /rooms/i })).toBeInTheDocument();
        });

        it('renders 8 room cards', async () => {
            renderRooms();
            await waitFor(() => {
                const cards = document.querySelectorAll('.room-card');
                expect(cards).toHaveLength(8);
            });
        });

        it('renders a card for each expected room name', async () => {
            renderRooms();
            const roomNames = ['Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Office', 'Entryway', 'Laundry Room', 'Garage'];
            for (const name of roomNames) {
                expect(screen.getByText(name)).toBeInTheDocument();
            }
        });
    });

    describe('completion ring', () => {
        it('renders an SVG ring for each room card', async () => {
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            const svgs = document.querySelectorAll('.room-ring-wrap svg');
            expect(svgs).toHaveLength(8);
        });

        it('renders the room emoji inside the ring wrap', async () => {
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            const emojis = document.querySelectorAll('.room-ring-emoji');
            expect(emojis).toHaveLength(8);
        });
    });

    describe('chore counts', () => {
        it('shows "0 chores" when there are no chores', async () => {
            API.getChores.mockResolvedValue([]);
            renderRooms();
            await waitFor(() => {
                const counts = screen.getAllByText('0 chores');
                expect(counts.length).toBeGreaterThan(0);
            });
        });

        it('shows singular "1 chore" label', async () => {
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Scrub sink', frequency: 'Weekly', room: 'Kitchen' },
            ]);
            renderRooms();
            await waitFor(() => {
                expect(screen.getByText('1 chore')).toBeInTheDocument();
            });
        });

        it('shows plural "2 chores" label for multiple chores', async () => {
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Scrub sink', frequency: 'Weekly', room: 'Kitchen' },
                { id: 'c2', name: 'Wipe stovetop', frequency: 'Weekly', room: 'Kitchen' },
            ]);
            renderRooms();
            await waitFor(() => {
                expect(screen.getByText('2 chores')).toBeInTheDocument();
            });
        });

        it('shows overdue badge when a room has overdue chores', async () => {
            const overdueDate = new Date();
            overdueDate.setDate(overdueDate.getDate() - 30);
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Mop floor', frequency: 'Weekly', room: 'Kitchen', lastDone: overdueDate },
            ]);
            renderRooms();
            await waitFor(() => {
                expect(screen.getByText(/1 overdue/i)).toBeInTheDocument();
            });
        });
    });

    describe('room selection', () => {
        it('does not show room detail panel initially', async () => {
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            expect(document.querySelector('.room-detail')).not.toBeInTheDocument();
        });

        it('shows room detail panel after clicking a room', async () => {
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            expect(document.querySelector('.room-detail')).toBeInTheDocument();
        });

        it('shows room detail title with room name', async () => {
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            expect(screen.getByRole('heading', { name: /kitchen/i, level: 3 })).toBeInTheDocument();
        });

        it('shows empty state message when selected room has no chores', async () => {
            API.getChores.mockResolvedValue([]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            expect(screen.getByText(/no chores in this room yet/i)).toBeInTheDocument();
        });

        it('shows chores for the selected room', async () => {
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Wipe stovetop', frequency: 'Weekly', room: 'Kitchen' },
            ]);
            renderRooms();
            await waitFor(() => screen.getByText('1 chore'));
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            expect(screen.getByText('Wipe stovetop')).toBeInTheDocument();
        });

        it('hides room detail when the selected room is clicked again', async () => {
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            expect(document.querySelector('.room-detail')).toBeInTheDocument();
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            expect(document.querySelector('.room-detail')).not.toBeInTheDocument();
        });

        it('marks the selected room card with "selected" class', async () => {
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            const kitchenBtn = screen.getByRole('button', { name: /kitchen/i });
            fireEvent.click(kitchenBtn);
            expect(kitchenBtn).toHaveClass('selected');
        });

        it('renders Complete button for each chore in room detail', async () => {
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Wipe stovetop', frequency: 'Weekly', room: 'Kitchen' },
                { id: 'c2', name: 'Scrub sink', frequency: 'Monthly', room: 'Kitchen' },
            ]);
            renderRooms();
            await waitFor(() => screen.getByText('2 chores'));
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            const completeButtons = screen.getAllByRole('button', { name: /complete/i });
            expect(completeButtons).toHaveLength(2);
        });

        it('calls API.completeChore when Complete is clicked', async () => {
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Wipe stovetop', frequency: 'Weekly', room: 'Kitchen' },
            ]);
            renderRooms();
            await waitFor(() => screen.getByText('1 chore'));
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            fireEvent.click(screen.getByRole('button', { name: /complete/i }));
            await waitFor(() => {
                expect(API.completeChore).toHaveBeenCalledWith('test-uid', 'c1', null);
            });
        });
    });
});
