import { NavLink, Outlet } from 'react-router-dom';
import { Users, Stethoscope, Building2, Activity } from 'lucide-react';
import './MainLayout.css';

const navItems = [
    { to: '/patient', label: 'Patient', icon: Users },
    { to: '/doctor', label: 'Doctor', icon: Stethoscope },
    { to: '/department', label: 'Department', icon: Building2 },
];

const MainLayout = () => {
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
                    <p>Hospital API Console</p>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
