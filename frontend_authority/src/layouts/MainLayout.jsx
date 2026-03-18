import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Users, Stethoscope, Building2, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MainLayout.css';

const navItems = [
    { to: '/patient', label: 'Patient', icon: Users },
    { to: '/doctor', label: 'Doctor', icon: Stethoscope },
    { to: '/department', label: 'Department', icon: Building2 },
];

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Activity className="sidebar-logo" size={28} />
                    <h1 className="sidebar-title">MediVault</h1>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'nav-link-active' : ''}`
                            }
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {user && (
                        <p className="sidebar-user-name">{user.name}</p>
                    )}
                    <button
                        className="sidebar-logout-btn"
                        onClick={handleLogout}
                        id="logout-btn"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
