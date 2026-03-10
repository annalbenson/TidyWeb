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
        addRoom: vi.fn().mockResolvedValue('new-room-id'),
        updateRoom: vi.fn().mockResolvedValue(undefined),
        deleteRoom: vi.fn().mockResolvedValue(undefined),
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
        localStorage.clear(); // prevent viewMode from leaking between tests
        API.getChores.mockResolvedValue([]);
        API.getRooms.mockResolvedValue([]);
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

    describe('By Name view', () => {
        function switchToNameView() {
            fireEvent.click(screen.getByRole('button', { name: /by name/i }));
        }

        it('toggling to By Name shows empty state when no rooms exist', async () => {
            API.getRooms.mockResolvedValue([]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            switchToNameView();
            expect(screen.getByText(/no named rooms yet/i)).toBeInTheDocument();
        });

        it('toggling to By Name shows named room cards when rooms exist', async () => {
            API.getRooms.mockResolvedValue([
                { id: 'r1', name: 'Master Bathroom', type: 'Bathroom' },
            ]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            switchToNameView();
            await waitFor(() => {
                expect(screen.getByText('Master Bathroom')).toBeInTheDocument();
            });
        });

        it('named room card shows the room name and type label', async () => {
            API.getRooms.mockResolvedValue([
                { id: 'r1', name: 'Master Bathroom', type: 'Bathroom' },
            ]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            switchToNameView();
            await waitFor(() => screen.getByText('Master Bathroom'));
            expect(screen.getByText('Bathroom')).toBeInTheDocument();
        });

        it('clicking a named room card opens the detail panel with its name', async () => {
            API.getRooms.mockResolvedValue([
                { id: 'r1', name: 'Master Bathroom', type: 'Bathroom' },
            ]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            switchToNameView();
            await waitFor(() => screen.getByText('Master Bathroom'));
            fireEvent.click(screen.getByRole('button', { name: /master bathroom/i }));
            expect(screen.getByRole('heading', { name: /master bathroom/i, level: 3 })).toBeInTheDocument();
        });

        it('clicking a named room card opens detail panel showing its chores', async () => {
            API.getRooms.mockResolvedValue([
                { id: 'r1', name: 'Master Bathroom', type: 'Bathroom' },
            ]);
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Scrub toilet', frequency: 'Weekly', room: 'Master Bathroom' },
            ]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            switchToNameView();
            await waitFor(() => screen.getByText('1 chore'));
            fireEvent.click(screen.getByRole('button', { name: /master bathroom/i }));
            expect(screen.getByText('Scrub toilet')).toBeInTheDocument();
        });

        it('shows the Add Room form when "+ Add Room" is clicked', async () => {
            API.getRooms.mockResolvedValue([]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            switchToNameView();
            fireEvent.click(screen.getByRole('button', { name: /\+ add room/i }));
            expect(screen.getByPlaceholderText(/master bathroom/i)).toBeInTheDocument();
        });

        it('calls API.addRoom with name and type when the add form is submitted', async () => {
            API.getRooms.mockResolvedValue([]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            switchToNameView();
            fireEvent.click(screen.getByRole('button', { name: /\+ add room/i }));
            fireEvent.change(screen.getByPlaceholderText(/master bathroom/i), { target: { value: 'Guest Bathroom' } });
            fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
            await waitFor(() => {
                expect(API.addRoom).toHaveBeenCalledWith('test-uid', expect.objectContaining({ name: 'Guest Bathroom' }));
            });
        });

        it('shows "Remove room" button in detail panel for named rooms', async () => {
            API.getRooms.mockResolvedValue([
                { id: 'r1', name: 'Guest Bathroom', type: 'Bathroom' },
            ]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            switchToNameView();
            await waitFor(() => screen.getByText('Guest Bathroom'));
            fireEvent.click(screen.getByRole('button', { name: /guest bathroom/i }));
            expect(screen.getByRole('button', { name: /remove room/i })).toBeInTheDocument();
        });

        it('calls API.deleteRoom when delete is confirmed', async () => {
            API.getRooms.mockResolvedValue([
                { id: 'r1', name: 'Guest Bathroom', type: 'Bathroom' },
            ]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            switchToNameView();
            await waitFor(() => screen.getByText('Guest Bathroom'));
            fireEvent.click(screen.getByRole('button', { name: /guest bathroom/i }));
            fireEvent.click(screen.getByRole('button', { name: /remove room/i }));
            fireEvent.click(screen.getByRole('button', { name: /^yes$/i }));
            await waitFor(() => {
                expect(API.deleteRoom).toHaveBeenCalledWith('test-uid', 'r1');
            });
        });
    });

    describe('rename named room', () => {
        async function openRenameFor(roomName) {
            fireEvent.click(screen.getByRole('button', { name: /by name/i }));
            await waitFor(() => screen.getByText(roomName));
            fireEvent.click(screen.getByRole('button', { name: new RegExp(roomName, 'i') }));
            fireEvent.click(screen.getByRole('button', { name: /^rename$/i }));
        }

        it('shows a Rename button in the detail panel for named rooms', async () => {
            API.getRooms.mockResolvedValue([{ id: 'r1', name: 'Bathroom 2', type: 'Bathroom' }]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            fireEvent.click(screen.getByRole('button', { name: /by name/i }));
            await waitFor(() => screen.getByText('Bathroom 2'));
            fireEvent.click(screen.getByRole('button', { name: /bathroom 2/i }));
            expect(screen.getByRole('button', { name: /^rename$/i })).toBeInTheDocument();
        });

        it('clicking Rename shows an input pre-filled with the current room name', async () => {
            API.getRooms.mockResolvedValue([{ id: 'r1', name: 'Bathroom 2', type: 'Bathroom' }]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            await openRenameFor('Bathroom 2');
            const input = screen.getByRole('textbox');
            expect(input.value).toBe('Bathroom 2');
        });

        it('Cancel hides the rename input and restores the header', async () => {
            API.getRooms.mockResolvedValue([{ id: 'r1', name: 'Bathroom 2', type: 'Bathroom' }]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            await openRenameFor('Bathroom 2');
            fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
            expect(screen.getByRole('heading', { name: /bathroom 2/i, level: 3 })).toBeInTheDocument();
        });

        it('Save calls API.updateRoom with the new name', async () => {
            API.getRooms.mockResolvedValue([{ id: 'r1', name: 'Bathroom 2', type: 'Bathroom' }]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            await openRenameFor('Bathroom 2');
            fireEvent.change(screen.getByRole('textbox'), { target: { value: "Kid's Bathroom" } });
            fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
            await waitFor(() => expect(API.updateRoom).toHaveBeenCalledWith('test-uid', 'r1', { name: "Kid's Bathroom" }));
        });

        it('after save, the room card and detail panel show the new name', async () => {
            API.getRooms.mockResolvedValue([{ id: 'r1', name: 'Bathroom 2', type: 'Bathroom' }]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            await openRenameFor('Bathroom 2');
            fireEvent.change(screen.getByRole('textbox'), { target: { value: "Kid's Bathroom" } });
            fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
            await waitFor(() => expect(API.updateRoom).toHaveBeenCalled());
            expect(screen.getByText("Kid's Bathroom")).toBeInTheDocument();
        });

        it('Save with an unchanged name does not call API.updateRoom', async () => {
            API.getRooms.mockResolvedValue([{ id: 'r1', name: 'Bathroom 2', type: 'Bathroom' }]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            await openRenameFor('Bathroom 2');
            // leave value unchanged and save
            fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
            await new Promise(r => setTimeout(r, 100));
            expect(API.updateRoom).not.toHaveBeenCalled();
        });

        it('Save calls API.updateChore for each chore in the renamed room', async () => {
            API.getRooms.mockResolvedValue([{ id: 'r1', name: 'Bathroom 2', type: 'Bathroom' }]);
            API.getChores.mockResolvedValue([
                { id: 'c1', name: 'Scrub toilet', frequency: 'Weekly', room: 'Bathroom 2' },
                { id: 'c2', name: 'Wipe sink', frequency: 'Weekly', room: 'Bathroom 2' },
            ]);
            renderRooms();
            await waitFor(() => screen.getByText('2 chores'));
            await openRenameFor('Bathroom 2');
            fireEvent.change(screen.getByRole('textbox'), { target: { value: "Kid's Bathroom" } });
            fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
            await waitFor(() => expect(API.updateRoom).toHaveBeenCalled());
            expect(API.updateChore).toHaveBeenCalledWith('test-uid', 'c1', { room: "Kid's Bathroom" }, null);
            expect(API.updateChore).toHaveBeenCalledWith('test-uid', 'c2', { room: "Kid's Bathroom" }, null);
        });

        it('Save does not call API.updateChore when the room has no chores', async () => {
            API.getRooms.mockResolvedValue([{ id: 'r1', name: 'Bathroom 2', type: 'Bathroom' }]);
            API.getChores.mockResolvedValue([]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            await openRenameFor('Bathroom 2');
            fireEvent.change(screen.getByRole('textbox'), { target: { value: "Kid's Bathroom" } });
            fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
            await waitFor(() => expect(API.updateRoom).toHaveBeenCalled());
            expect(API.updateChore).not.toHaveBeenCalled();
        });

        it('pressing Enter in the rename input saves the new name', async () => {
            API.getRooms.mockResolvedValue([{ id: 'r1', name: 'Bathroom 2', type: 'Bathroom' }]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            await openRenameFor('Bathroom 2');
            const input = screen.getByRole('textbox');
            fireEvent.change(input, { target: { value: 'Guest Bath' } });
            fireEvent.keyDown(input, { key: 'Enter' });
            await waitFor(() => expect(API.updateRoom).toHaveBeenCalledWith('test-uid', 'r1', { name: 'Guest Bath' }));
        });

        it('pressing Escape cancels the rename', async () => {
            API.getRooms.mockResolvedValue([{ id: 'r1', name: 'Bathroom 2', type: 'Bathroom' }]);
            renderRooms();
            await waitFor(() => screen.getAllByText('0 chores'));
            await openRenameFor('Bathroom 2');
            fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        });
    });
});
