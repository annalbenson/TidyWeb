import { NavLink } from 'react-router-dom';

export default function Sidebar({ user, onLogout }) {
    const firstName = user?.displayName?.split(' ')[0] ?? 'there';

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <NavLink to="/dashboard/chores" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
                    <span className="sidebar-icon">✅</span> Chores
                </NavLink>
                <NavLink to="/dashboard/rooms" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
                    <span className="sidebar-icon">🏠</span> Rooms
                </NavLink>
                <NavLink to="/dashboard/profile" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
                    <span className="sidebar-icon">🪴</span> Profile
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <span className="sidebar-user">Hi, {firstName}</span>
                <button className="sidebar-logout" onClick={onLogout}>Log Out</button>
            </div>
        </aside>
    );
}
