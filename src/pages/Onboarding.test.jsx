import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../AuthContext', () => ({ useAuth: () => ({ uid: 'test-uid', displayName: 'Anna Smith' }) }));

vi.mock('../api', () => ({
    API: {
        getProfile: vi.fn().mockResolvedValue(null),
        saveProfile: vi.fn().mockResolvedValue(undefined),
        addChore: vi.fn().mockResolvedValue({ id: 'c1' }),
        addRoom: vi.fn().mockResolvedValue('r1'),
    }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

import Onboarding from './Onboarding';
import { API } from '../api';

function renderOnboarding() {
    return render(
        <MemoryRouter>
            <Onboarding />
        </MemoryRouter>
    );
}

// Shared helper: advances through the first 6 steps to reach pain points
const T = 2000; // per-step waitFor timeout (ms) — Tilly has a 600ms typing delay
async function advanceToPainPoints() {
    await waitFor(() => screen.getByText(/what kind of place do you live in/i), { timeout: T });
    fireEvent.click(screen.getByRole('button', { name: 'Apartment' }));
    await waitFor(() => screen.getByText(/how many bedrooms/i), { timeout: T });
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    await waitFor(() => screen.getByText(/and bathrooms/i), { timeout: T });
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    await waitFor(() => screen.getByText(/do you have laundry at home/i), { timeout: T });
    fireEvent.click(screen.getByRole('button', { name: 'In-unit' }));
    await waitFor(() => screen.getByText(/who shares the space/i), { timeout: T });
    fireEvent.click(screen.getByRole('button', { name: 'Just me' }));
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    await waitFor(() => screen.getByText(/how would you describe your current cleaning routine/i), { timeout: T });
    fireEvent.click(screen.getByRole('button', { name: 'Weekly sweep' }));
    await waitFor(() => screen.getByText(/any cleaning sore spots/i), { timeout: T });
}

// Completes the full 7-step flow with default selections, then waits for saveProfile
async function completeOnboarding() {
    await advanceToPainPoints();
    fireEvent.click(screen.getByRole('button', { name: 'Dishes piling up' }));
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    await waitFor(() => expect(API.saveProfile).toHaveBeenCalled(), { timeout: 5000 });
}

describe('Onboarding', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        API.getProfile.mockResolvedValue(null);
        API.saveProfile.mockResolvedValue(undefined);
        API.addChore.mockResolvedValue({ id: 'c1' });
        API.addRoom.mockResolvedValue('r1');
        mockNavigate.mockReset();
    });

    it("renders Tilly's first message asking about home type", async () => {
        renderOnboarding();
        await waitFor(() => {
            expect(screen.getByText(/what kind of place do you live in/i)).toBeInTheDocument();
        });
    });

    it('shows chip options for homeType (Apartment, House, Condo, etc.)', async () => {
        renderOnboarding();
        await waitFor(() => screen.getByText(/what kind of place do you live in/i));
        expect(screen.getByRole('button', { name: 'Apartment' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'House' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Condo' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Studio' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Townhouse' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Duplex' })).toBeInTheDocument();
    });

    it('clicking a homeType chip advances to the bedrooms step', async () => {
        renderOnboarding();
        await waitFor(() => screen.getByText(/what kind of place do you live in/i));
        fireEvent.click(screen.getByRole('button', { name: 'Apartment' }));
        await waitFor(() => {
            expect(screen.getByText(/how many bedrooms/i)).toBeInTheDocument();
        });
    });

    it('shows bedroom chips 1-5+ on the bedrooms step', async () => {
        renderOnboarding();
        await waitFor(() => screen.getByText(/what kind of place do you live in/i));
        fireEvent.click(screen.getByRole('button', { name: 'Apartment' }));
        await waitFor(() => screen.getByText(/how many bedrooms/i));
        for (const label of ['1', '2', '3', '4', '5+']) {
            expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
        }
    });

    it('clicking a bedroom chip advances to the bathrooms step', async () => {
        renderOnboarding();
        await waitFor(() => screen.getByText(/what kind of place do you live in/i));
        fireEvent.click(screen.getByRole('button', { name: 'House' }));
        await waitFor(() => screen.getByText(/how many bedrooms/i));
        fireEvent.click(screen.getByRole('button', { name: '2' }));
        await waitFor(() => {
            expect(screen.getByText(/and bathrooms/i)).toBeInTheDocument();
        });
    });

    it('shows 15 chips on the pain points step', async () => {
        renderOnboarding();
        await advanceToPainPoints();
        const chips = document.querySelectorAll('.ob-chip');
        expect(chips).toHaveLength(15);
    }, 15000);

    it('pain points: selecting 3 chips enables the Done button', async () => {
        renderOnboarding();
        await advanceToPainPoints();
        fireEvent.click(screen.getByRole('button', { name: 'Dishes piling up' }));
        fireEvent.click(screen.getByRole('button', { name: 'Mopping floors' }));
        fireEvent.click(screen.getByRole('button', { name: 'Decluttering' }));
        expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
    }, 15000);

    it('pain points: a 4th chip is disabled after 3 are selected', async () => {
        renderOnboarding();
        await advanceToPainPoints();
        fireEvent.click(screen.getByRole('button', { name: 'Dishes piling up' }));
        fireEvent.click(screen.getByRole('button', { name: 'Mopping floors' }));
        fireEvent.click(screen.getByRole('button', { name: 'Decluttering' }));
        expect(screen.getByRole('button', { name: 'Vacuuming regularly' })).toBeDisabled();
    }, 15000);

    it('pain points: counter shows "3/3 selected" after 3 chips are selected', async () => {
        renderOnboarding();
        await advanceToPainPoints();
        fireEvent.click(screen.getByRole('button', { name: 'Dishes piling up' }));
        fireEvent.click(screen.getByRole('button', { name: 'Mopping floors' }));
        fireEvent.click(screen.getByRole('button', { name: 'Decluttering' }));
        expect(screen.getByText('3/3 selected')).toBeInTheDocument();
    }, 15000);

    it('Done button is not shown before any chip is selected on a multi-select step', async () => {
        renderOnboarding();
        await advanceToPainPoints();
        expect(screen.queryByRole('button', { name: /done/i })).not.toBeInTheDocument();
    }, 15000);

    it('multi-select chip can be deselected by clicking it again', async () => {
        renderOnboarding();
        await advanceToPainPoints();
        fireEvent.click(screen.getByRole('button', { name: 'Dishes piling up' }));
        expect(screen.getByText('1/3 selected')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Dishes piling up' }));
        expect(screen.getByText('0/3 selected')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /done/i })).not.toBeInTheDocument();
    }, 15000);

    it('householdMembers requires Done to advance (does not auto-advance on single click)', async () => {
        renderOnboarding();
        await waitFor(() => screen.getByText(/what kind of place do you live in/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'Apartment' }));
        await waitFor(() => screen.getByText(/how many bedrooms/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: '1' }));
        await waitFor(() => screen.getByText(/and bathrooms/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: '1' }));
        await waitFor(() => screen.getByText(/do you have laundry at home/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'In-unit' }));
        await waitFor(() => screen.getByText(/who shares the space/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'Just me' }));
        // Selecting a chip should NOT auto-advance
        expect(screen.queryByText(/how would you describe your current cleaning routine/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
    });

    // ── Profile already exists ────────────────────────────────────────────────

    it('redirects to dashboard immediately if profile already exists', async () => {
        API.getProfile.mockResolvedValue({ homeType: 'House' });
        renderOnboarding();
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard/plan', { replace: true }));
        expect(screen.queryByText(/what kind of place do you live in/i)).not.toBeInTheDocument();
    });

    // ── Full completion flow ──────────────────────────────────────────────────

    it('saves profile with all collected answers on completion', async () => {
        renderOnboarding();
        await completeOnboarding();
        // advanceToPainPoints uses: Apartment, 1 bed, 1 bath, In-unit, Just me, Weekly sweep
        expect(API.saveProfile).toHaveBeenCalledWith('test-uid', expect.objectContaining({
            homeType: 'Apartment',
            bedrooms: 1,
            bathrooms: 1,
            laundryType: 'In-unit',
            cleaningStyle: 'Weekly sweep',
        }));
    }, 20000);

    it('calls addChore 12 times for default profile (1 bed, 1 bath, in-unit)', async () => {
        // base:3 + bed:1 + bath:3 + kitchen:4 + laundry:1 = 12
        renderOnboarding();
        await completeOnboarding();
        await waitFor(() => expect(API.addChore).toHaveBeenCalledTimes(12), { timeout: 3000 });
    }, 20000);

    it('calls addRoom 0 times for single bedroom and single bathroom', async () => {
        renderOnboarding();
        await completeOnboarding();
        await waitFor(() => expect(API.addChore).toHaveBeenCalled(), { timeout: 3000 });
        expect(API.addRoom).not.toHaveBeenCalled();
    }, 20000);

    it('navigates to /dashboard/plan after completing all steps', async () => {
        renderOnboarding();
        await completeOnboarding();
        await waitFor(
            () => expect(mockNavigate).toHaveBeenCalledWith('/dashboard/plan', { replace: true }),
            { timeout: 3000 }
        );
    }, 20000);

    it('shows error message and does not navigate if saveProfile fails', async () => {
        API.saveProfile.mockRejectedValue(new Error('network error'));
        renderOnboarding();
        await advanceToPainPoints();
        fireEvent.click(screen.getByRole('button', { name: 'Dishes piling up' }));
        fireEvent.click(screen.getByRole('button', { name: /done/i }));
        await waitFor(() => screen.getByText(/something went wrong saving/i), { timeout: 5000 });
        expect(mockNavigate).not.toHaveBeenCalled();
    }, 20000);

    // ── Bedroom / bathroom edge cases ─────────────────────────────────────────

    it('5+ bedrooms: calls addRoom 5 times with Bedroom 1–5', async () => {
        renderOnboarding();
        await waitFor(() => screen.getByText(/what kind of place do you live in/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'House' }));
        await waitFor(() => screen.getByText(/how many bedrooms/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: '5+' }));
        await waitFor(() => screen.getByText(/and bathrooms/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: '1' }));
        await waitFor(() => screen.getByText(/do you have laundry at home/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'In-unit' }));
        await waitFor(() => screen.getByText(/who shares the space/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'Just me' }));
        fireEvent.click(screen.getByRole('button', { name: /done/i }));
        await waitFor(() => screen.getByText(/how would you describe your current cleaning routine/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'Weekly sweep' }));
        await waitFor(() => screen.getByText(/any cleaning sore spots/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'Dishes piling up' }));
        fireEvent.click(screen.getByRole('button', { name: /done/i }));
        await waitFor(() => expect(API.addRoom).toHaveBeenCalledTimes(5), { timeout: 5000 });
        expect(API.addRoom).toHaveBeenCalledWith('test-uid', { name: 'Bedroom 1', type: 'Bedroom' });
        expect(API.addRoom).toHaveBeenCalledWith('test-uid', { name: 'Bedroom 5', type: 'Bedroom' });
    }, 20000);

    // ── Laundry type ──────────────────────────────────────────────────────────

    it('Laundromat selection: no "Do laundry" chore is added', async () => {
        renderOnboarding();
        await waitFor(() => screen.getByText(/what kind of place do you live in/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'Apartment' }));
        await waitFor(() => screen.getByText(/how many bedrooms/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: '1' }));
        await waitFor(() => screen.getByText(/and bathrooms/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: '1' }));
        await waitFor(() => screen.getByText(/do you have laundry at home/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'Laundromat' }));
        await waitFor(() => screen.getByText(/who shares the space/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'Just me' }));
        fireEvent.click(screen.getByRole('button', { name: /done/i }));
        await waitFor(() => screen.getByText(/how would you describe your current cleaning routine/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'Weekly sweep' }));
        await waitFor(() => screen.getByText(/any cleaning sore spots/i), { timeout: T });
        fireEvent.click(screen.getByRole('button', { name: 'Dishes piling up' }));
        fireEvent.click(screen.getByRole('button', { name: /done/i }));
        await waitFor(() => expect(API.addChore).toHaveBeenCalled(), { timeout: 5000 });
        const addedNames = API.addChore.mock.calls.map(c => c[1].name);
        expect(addedNames).not.toContain('Do laundry');
    }, 20000);
});
