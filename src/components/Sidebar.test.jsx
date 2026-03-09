import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

function renderSidebar(props = {}) {
    const defaults = { user: null, onLogout: vi.fn() };
    return render(
        <MemoryRouter>
            <Sidebar {...defaults} {...props} />
        </MemoryRouter>
    );
}

describe('Sidebar', () => {
    it('renders the Chores nav link', () => {
        renderSidebar();
        expect(screen.getByRole('link', { name: /chores/i })).toBeInTheDocument();
    });

    it('renders the Rooms nav link', () => {
        renderSidebar();
        expect(screen.getByRole('link', { name: /rooms/i })).toBeInTheDocument();
    });

    it('renders the Weekly Plan nav link', () => {
        renderSidebar();
        expect(screen.getByRole('link', { name: /weekly plan/i })).toBeInTheDocument();
    });

    it('renders the Profile nav link', () => {
        renderSidebar();
        expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    });

    it('renders the Declutter nav link', () => {
        renderSidebar();
        expect(screen.getByRole('link', { name: /declutter/i })).toBeInTheDocument();
    });

    it('renders 6 nav links total', () => {
        renderSidebar();
        expect(screen.getAllByRole('link')).toHaveLength(6);
    });

    it('renders the Log Out button', () => {
        renderSidebar();
        expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    });

    it('calls onLogout when Log Out is clicked', () => {
        const onLogout = vi.fn();
        renderSidebar({ onLogout });
        fireEvent.click(screen.getByRole('button', { name: /log out/i }));
        expect(onLogout).toHaveBeenCalledOnce();
    });

    it('shows first name when user has a displayName', () => {
        renderSidebar({ user: { displayName: 'Anna Benson' } });
        expect(screen.getByText(/hi, anna/i)).toBeInTheDocument();
    });

    it('shows "there" when user has no displayName', () => {
        renderSidebar({ user: null });
        expect(screen.getByText(/hi, there/i)).toBeInTheDocument();
    });

    it('Chores link points to /dashboard/chores', () => {
        renderSidebar();
        expect(screen.getByRole('link', { name: /chores/i })).toHaveAttribute('href', '/dashboard/chores');
    });

    it('Rooms link points to /dashboard/rooms', () => {
        renderSidebar();
        expect(screen.getByRole('link', { name: /rooms/i })).toHaveAttribute('href', '/dashboard/rooms');
    });

    it('Plan link points to /dashboard/plan', () => {
        renderSidebar();
        expect(screen.getByRole('link', { name: /weekly plan/i })).toHaveAttribute('href', '/dashboard/plan');
    });

    it('Profile link points to /dashboard/profile', () => {
        renderSidebar();
        expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/dashboard/profile');
    });

    it('Declutter link points to /dashboard/declutter', () => {
        renderSidebar();
        expect(screen.getByRole('link', { name: /declutter/i })).toHaveAttribute('href', '/dashboard/declutter');
    });
});
