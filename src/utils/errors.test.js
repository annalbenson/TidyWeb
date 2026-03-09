import { describe, it, expect } from 'vitest';
import { friendlyAuthError } from './errors';

describe('friendlyAuthError', () => {
    it('returns wrong-password message for auth/invalid-credential', () => {
        expect(friendlyAuthError('auth/invalid-credential')).toBe('Incorrect email or password.');
    });

    it('returns wrong-password message for auth/user-not-found', () => {
        expect(friendlyAuthError('auth/user-not-found')).toBe('Incorrect email or password.');
    });

    it('returns wrong-password message for auth/wrong-password', () => {
        expect(friendlyAuthError('auth/wrong-password')).toBe('Incorrect email or password.');
    });

    it('returns rate-limit message for auth/too-many-requests', () => {
        expect(friendlyAuthError('auth/too-many-requests')).toBe('Too many attempts. Try again in a few minutes.');
    });

    it('returns duplicate-email message for auth/email-already-in-use', () => {
        expect(friendlyAuthError('auth/email-already-in-use')).toBe('An account with that email already exists.');
    });

    it('returns weak-password message for auth/weak-password', () => {
        expect(friendlyAuthError('auth/weak-password')).toBe('Password must be at least 6 characters.');
    });

    it('returns invalid-email message for auth/invalid-email', () => {
        expect(friendlyAuthError('auth/invalid-email')).toBe('Please enter a valid email address.');
    });

    it('returns generic fallback for unknown error codes', () => {
        expect(friendlyAuthError('auth/network-request-failed')).toBe('Something went wrong. Please try again.');
    });

    it('returns generic fallback for empty string', () => {
        expect(friendlyAuthError('')).toBe('Something went wrong. Please try again.');
    });

    it('returns generic fallback for undefined', () => {
        expect(friendlyAuthError(undefined)).toBe('Something went wrong. Please try again.');
    });
});
