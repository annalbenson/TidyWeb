import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Declutter from './Declutter';

function renderDeclutter() {
    return render(
        <MemoryRouter>
            <Declutter />
        </MemoryRouter>
    );
}

describe('Declutter', () => {
    describe('pick phase (initial load)', () => {
        it('renders the room picker heading on initial load', () => {
            renderDeclutter();
            expect(screen.getByRole('heading', { name: /declutter mode/i })).toBeInTheDocument();
        });

        it('renders all 8 room buttons', () => {
            renderDeclutter();
            const rooms = ['Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Office', 'Entryway', 'Laundry Room', 'Garage'];
            for (const room of rooms) {
                expect(screen.getByRole('button', { name: new RegExp(room, 'i') })).toBeInTheDocument();
            }
        });

        it('renders the Surprise me button', () => {
            renderDeclutter();
            expect(screen.getByRole('button', { name: /surprise me/i })).toBeInTheDocument();
        });

        it('renders exactly 9 room buttons (8 rooms + Surprise me)', () => {
            renderDeclutter();
            expect(screen.getAllByRole('button')).toHaveLength(9);
        });
    });

    describe('session phase', () => {
        it('transitions to task card view after clicking a room', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            expect(screen.getByText(/task 1 of 5/i)).toBeInTheDocument();
        });

        it('shows "Task 1 of 5" on the first card', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /bathroom/i }));
            expect(screen.getByText('Task 1 of 5')).toBeInTheDocument();
        });

        it('renders the Done button in task view', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /bedroom/i }));
            expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
        });

        it('renders the Skip button in task view', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /bedroom/i }));
            expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
        });

        it('advances to Task 2 after clicking Done', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            fireEvent.click(screen.getByRole('button', { name: /done/i }));
            expect(screen.getByText('Task 2 of 5')).toBeInTheDocument();
        });

        it('advances to Task 2 after clicking Skip', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            fireEvent.click(screen.getByRole('button', { name: /skip/i }));
            expect(screen.getByText('Task 2 of 5')).toBeInTheDocument();
        });
    });

    describe('celebration (done) phase', () => {
        function completeAllTasks(times = 5, action = 'done') {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            for (let i = 0; i < 5; i++) {
                if (i < times) {
                    fireEvent.click(screen.getByRole('button', { name: /done/i }));
                } else {
                    fireEvent.click(screen.getByRole('button', { name: /skip/i }));
                }
            }
        }

        it('renders celebration screen after completing all 5 tasks', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            for (let i = 0; i < 5; i++) {
                fireEvent.click(screen.getByRole('button', { name: /done/i }));
            }
            expect(screen.getByText(/you crushed it/i)).toBeInTheDocument();
        });

        it('renders celebration screen after skipping all 5 tasks', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            for (let i = 0; i < 5; i++) {
                fireEvent.click(screen.getByRole('button', { name: /skip/i }));
            }
            // 0 done → "That's okay!" message
            expect(screen.getByText(/that's okay/i)).toBeInTheDocument();
        });

        it('shows "great session" message when 3 tasks are done', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            // Complete 3, skip 2
            for (let i = 0; i < 3; i++) {
                fireEvent.click(screen.getByRole('button', { name: /done/i }));
            }
            for (let i = 0; i < 2; i++) {
                fireEvent.click(screen.getByRole('button', { name: /skip/i }));
            }
            expect(screen.getByText(/great session/i)).toBeInTheDocument();
        });

        it('shows "good start" message when only 1 task is done', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            fireEvent.click(screen.getByRole('button', { name: /done/i }));
            for (let i = 0; i < 4; i++) {
                fireEvent.click(screen.getByRole('button', { name: /skip/i }));
            }
            expect(screen.getByText(/good start/i)).toBeInTheDocument();
        });

        it('renders a "Go again" button on the celebration screen', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            for (let i = 0; i < 5; i++) {
                fireEvent.click(screen.getByRole('button', { name: /done/i }));
            }
            expect(screen.getByRole('button', { name: /go again/i })).toBeInTheDocument();
        });

        it('returns to room picker when "Go again" is clicked', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /kitchen/i }));
            for (let i = 0; i < 5; i++) {
                fireEvent.click(screen.getByRole('button', { name: /done/i }));
            }
            fireEvent.click(screen.getByRole('button', { name: /go again/i }));
            expect(screen.getByRole('heading', { name: /declutter mode/i })).toBeInTheDocument();
        });

        it('clicking Surprise me also starts a session', () => {
            renderDeclutter();
            fireEvent.click(screen.getByRole('button', { name: /surprise me/i }));
            expect(screen.getByText(/task 1 of 5/i)).toBeInTheDocument();
        });
    });
});
