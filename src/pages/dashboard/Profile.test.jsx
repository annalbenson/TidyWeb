import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../AuthContext', () => ({ useAuth: () => ({ uid: 'test-uid' }) }));

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

import Profile from './Profile';
import { API } from '../../api';

function renderProfile() {
    return render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
    );
}

describe('Profile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        API.getProfile.mockResolvedValue({ cleaningStyle: 'Weekly sweep', homeType: 'House' });
    });

    describe('page structure', () => {
        it('renders the "Profile" heading', () => {
            renderProfile();
            expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
        });

        it('renders the Edit button in view mode', async () => {
            renderProfile();
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
            });
        });

        it('renders the "Home & Cleaning Preferences" section title', async () => {
            renderProfile();
            await waitFor(() => {
                expect(screen.getByText(/home & cleaning preferences/i)).toBeInTheDocument();
            });
        });
    });

    describe('view mode', () => {
        it('displays the homeType value from profile', async () => {
            renderProfile();
            await waitFor(() => {
                expect(screen.getByText('House')).toBeInTheDocument();
            });
        });

        it('displays the cleaningStyle value from profile', async () => {
            renderProfile();
            await waitFor(() => {
                expect(screen.getByText('Weekly sweep')).toBeInTheDocument();
            });
        });

        it('shows "Not set" for fields that have no value', async () => {
            API.getProfile.mockResolvedValue({});
            renderProfile();
            await waitFor(() => {
                const notSetEls = screen.getAllByText('Not set');
                expect(notSetEls.length).toBeGreaterThan(0);
            });
        });

        it('shows profile field labels in view mode', async () => {
            renderProfile();
            await waitFor(() => {
                expect(screen.getByText('Home type')).toBeInTheDocument();
                expect(screen.getByText('Cleaning style')).toBeInTheDocument();
            });
        });
    });

    describe('edit mode', () => {
        it('switches to edit mode when Edit button is clicked', async () => {
            renderProfile();
            await waitFor(() => screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            // Edit button disappears in edit mode
            expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
            // Form inputs appear — the label text is in the DOM even without htmlFor
            expect(screen.getByText('Home type', { selector: 'label' })).toBeInTheDocument();
        });

        it('renders the Home type text input in edit mode', async () => {
            renderProfile();
            await waitFor(() => screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            // Profile.jsx labels don't have htmlFor — query by placeholder or container
            const inputs = screen.getAllByRole('textbox');
            expect(inputs.length).toBeGreaterThan(0);
        });

        it('renders household chips for all options in edit mode', async () => {
            renderProfile();
            await waitFor(() => screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            const chips = ['Just me', 'Partner', 'Kids', 'Roommates', 'Pets'];
            for (const chip of chips) {
                expect(screen.getByRole('button', { name: chip })).toBeInTheDocument();
            }
        });

        it('renders the Cleaning style select in edit mode', async () => {
            renderProfile();
            await waitFor(() => screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            // Profile.jsx labels don't use htmlFor — check by option text instead
            const selects = screen.getAllByRole('combobox');
            const cleaningStyleSelect = selects.find(sel =>
                Array.from(sel.querySelectorAll('option')).some(o => o.textContent === 'Weekly sweep')
            );
            expect(cleaningStyleSelect).toBeInTheDocument();
        });

        it('renders Save and Cancel buttons in edit mode', async () => {
            renderProfile();
            await waitFor(() => screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('returns to view mode when Cancel is clicked', async () => {
            renderProfile();
            await waitFor(() => screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
            expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument();
        });

        it('calls API.saveProfile when Save is clicked', async () => {
            renderProfile();
            await waitFor(() => screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
            await waitFor(() => {
                expect(API.saveProfile).toHaveBeenCalledWith('test-uid', expect.any(Object));
            });
        });

        it('returns to view mode after a successful save', async () => {
            renderProfile();
            await waitFor(() => screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument();
            });
        });

        it('toggles a household chip on and off', async () => {
            API.getProfile.mockResolvedValue({ householdMembers: '' });
            renderProfile();
            await waitFor(() => screen.getByRole('button', { name: /edit/i }));
            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            const petsChip = screen.getByRole('button', { name: 'Pets' });
            expect(petsChip).not.toHaveClass('selected');
            fireEvent.click(petsChip);
            expect(petsChip).toHaveClass('selected');
            fireEvent.click(petsChip);
            expect(petsChip).not.toHaveClass('selected');
        });
    });
});
