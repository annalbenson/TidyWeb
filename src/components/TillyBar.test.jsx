import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../AuthContext', () => ({ useAuth: () => ({ uid: 'test-uid' }) }));
vi.mock('../contexts/HouseholdContext', () => ({ useHousehold: () => ({ householdId: null, members: {}, loading: false }) }));

vi.mock('../api', () => ({
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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

import TillyBar from './TillyBar';
import { API } from '../api';

function renderTillyBar() {
    return render(
        <MemoryRouter>
            <TillyBar />
        </MemoryRouter>
    );
}

function sendMessage(text) {
    fireEvent.change(screen.getByPlaceholderText(/ask tilly/i), { target: { value: text } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
}

describe('TillyBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        API.getChores.mockResolvedValue([]);
        API.getProfile.mockResolvedValue({ cleaningStyle: 'Weekly sweep' });
        mockNavigate.mockReset();
    });

    describe('initial render', () => {
        it('renders the text input', () => {
            renderTillyBar();
            expect(screen.getByPlaceholderText(/ask tilly/i)).toBeInTheDocument();
        });

        it('renders the Send button', () => {
            renderTillyBar();
            expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
        });

        it('chat panel is hidden initially', () => {
            renderTillyBar();
            expect(document.querySelector('.tilly-chat-panel')).not.toBeInTheDocument();
        });
    });

    describe('sending messages', () => {
        it('opens the chat panel after sending a message', async () => {
            renderTillyBar();
            sendMessage('Hello');
            await waitFor(() => {
                expect(document.querySelector('.tilly-chat-panel')).toBeInTheDocument();
            });
        });

        it('adds the user message to the chat', async () => {
            renderTillyBar();
            sendMessage('Hello Tilly');
            await waitFor(() => {
                expect(screen.getByText('Hello Tilly')).toBeInTheDocument();
            });
        });

        it('clears the input after sending', async () => {
            renderTillyBar();
            const input = screen.getByPlaceholderText(/ask tilly/i);
            fireEvent.change(input, { target: { value: 'some text' } });
            fireEvent.click(screen.getByRole('button', { name: /send/i }));
            expect(input).toHaveValue('');
        });

        it('does not send an empty message', () => {
            renderTillyBar();
            fireEvent.click(screen.getByRole('button', { name: /send/i }));
            expect(document.querySelector('.tilly-chat-panel')).not.toBeInTheDocument();
        });

        it('sends message on Enter key press', async () => {
            renderTillyBar();
            const input = screen.getByPlaceholderText(/ask tilly/i);
            fireEvent.change(input, { target: { value: 'Hello' } });
            fireEvent.keyDown(input, { key: 'Enter' });
            await waitFor(() => {
                expect(screen.getByText('Hello')).toBeInTheDocument();
            });
        });

        it('shows the close button when chat is open', async () => {
            renderTillyBar();
            sendMessage('Hello');
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /close chat/i })).toBeInTheDocument();
            });
        });

        it('hides the chat panel when close button is clicked', async () => {
            renderTillyBar();
            sendMessage('Hello');
            await waitFor(() => screen.getByRole('button', { name: /close chat/i }));
            fireEvent.click(screen.getByRole('button', { name: /close chat/i }));
            expect(document.querySelector('.tilly-chat-panel')).not.toBeInTheDocument();
        });
    });

    describe('intent: quick task', () => {
        it('responds with "5-minute task" for "give me a quick task"', async () => {
            renderTillyBar();
            sendMessage('give me a quick task');
            await waitFor(() => {
                expect(screen.getByText(/5-minute task/i)).toBeInTheDocument();
            });
        });

        it('responds with "5-minute task" for "what can i do"', async () => {
            renderTillyBar();
            sendMessage('what can i do');
            await waitFor(() => {
                expect(screen.getByText(/5-minute task/i)).toBeInTheDocument();
            });
        });

        it('responds with "5-minute task" for "5 min task"', async () => {
            renderTillyBar();
            sendMessage('5 min task');
            await waitFor(() => {
                expect(screen.getByText(/5-minute task/i)).toBeInTheDocument();
            });
        });
    });

    describe('intent: daily plan', () => {
        it('calls API.getProfile for "make me a plan for today"', async () => {
            renderTillyBar();
            sendMessage('make me a plan for today');
            await waitFor(() => {
                expect(API.getProfile).toHaveBeenCalledWith('test-uid');
            });
        });

        it('responds with a plan for "plan for today"', async () => {
            renderTillyBar();
            sendMessage('plan for today');
            await waitFor(() => {
                // The response contains "Here's a solid plan" or "Let's keep it manageable"
                const chatPanel = document.querySelector('.tilly-chat-panel');
                expect(chatPanel?.textContent).toMatch(/plan|manageable/i);
            });
        });
    });

    describe('intent: start over', () => {
        it('asks for confirmation when "start over" is sent', async () => {
            renderTillyBar();
            sendMessage('start over');
            await waitFor(() => {
                expect(screen.getByText(/reply \*\*yes\*\* to confirm/i)).toBeInTheDocument();
            });
        });

        it('cancels reonboard when user replies with something other than yes', async () => {
            renderTillyBar();
            sendMessage('start over');
            await waitFor(() => screen.getByText(/reply \*\*yes\*\* to confirm/i));
            sendMessage('no thanks');
            await waitFor(() => {
                expect(screen.getByText(/nothing changed/i)).toBeInTheDocument();
            });
        });
    });

    describe('intent: declutter', () => {
        it('calls navigate to /dashboard/declutter for "let\'s declutter"', async () => {
            renderTillyBar();
            sendMessage("let's declutter");
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard/declutter');
            });
        });

        it('calls navigate for "clear out"', async () => {
            renderTillyBar();
            sendMessage('clear out my stuff');
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard/declutter');
            });
        });
    });

    describe('stub replies', () => {
        it('responds with stain advice for a message about stains', async () => {
            renderTillyBar();
            sendMessage('how do I remove a stain?');
            await waitFor(() => {
                expect(screen.getByText(/blot/i)).toBeInTheDocument();
            });
        });

        it('responds with bathroom tips for a message about the bathroom', async () => {
            renderTillyBar();
            sendMessage('how do I clean my bathroom?');
            await waitFor(() => {
                expect(screen.getByText(/bathroom routine/i)).toBeInTheDocument();
            });
        });

        it('responds with fallback for an unrecognised message', async () => {
            renderTillyBar();
            sendMessage('random unrecognized question xyz');
            // The stub reply fires after a 600ms setTimeout — use a longer waitFor timeout
            await waitFor(() => {
                expect(screen.getByText(/great question/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });
});
