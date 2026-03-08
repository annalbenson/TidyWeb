import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Chores from './pages/dashboard/Chores';
import Rooms from './pages/dashboard/Rooms';
import Profile from './pages/dashboard/Profile';
import Onboarding from './pages/Onboarding';

function ProtectedRoute({ children }) {
    const user = useAuth();
    if (user === undefined) return null;        // still initializing
    if (user === null) return <Navigate to="/login" replace />;
    return children;
}

function GuestRoute({ children }) {
    const user = useAuth();
    if (user === undefined) return null;        // still initializing
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="chores" replace />} />
                        <Route path="chores"  element={<Chores />} />
                        <Route path="rooms"   element={<Rooms />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
