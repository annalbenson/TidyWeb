import { NavLink } from 'react-router-dom';
import SucculentAvatar from './SucculentAvatar';

export default function Sidebar({ user, onLogout }) {
    const firstName = user?.displayName?.split(' ')[0] ?? 'there';

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <NavLink to="/dashboard/plan" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
                    <span className="sidebar-icon">📋</span> Weekly Plan
                </NavLink>
                <NavLink to="/dashboard/chores" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
                    <span className="sidebar-icon">✅</span> Chores
                </NavLink>
                <NavLink to="/dashboard/rooms" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
                    <span className="sidebar-icon">🏠</span> Rooms
                </NavLink>
                <NavLink to="/dashboard/declutter" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
                    <span className="sidebar-icon">🧹</span> Declutter
                </NavLink>
                <NavLink to="/dashboard/household" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
                    <span className="sidebar-icon">🏡</span> Household
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <span className="sidebar-user">
                    <SucculentAvatar uid={user?.uid} size={28} style={{ marginRight: 8 }} />
                    Hi, {firstName}
                </span>
                <NavLink to="/dashboard/profile" className={({ isActive }) => 'sidebar-footer-link' + (isActive ? ' active' : '')}>
                    Profile
                </NavLink>
                <button className="sidebar-logout" onClick={onLogout}>Log Out</button>
            </div>
        </aside>
    );
}
