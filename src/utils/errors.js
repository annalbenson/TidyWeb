export function friendlyAuthError(code) {
    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Incorrect email or password.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Try again in a few minutes.';
        case 'auth/email-already-in-use':
            return 'An account with that email already exists.';
        case 'auth/weak-password':
            return 'Password must be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        default:
            return 'Something went wrong. Please try again.';
    }
}
