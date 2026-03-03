import { useNavigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser, selectRole } from '../features/auth/authSlice';
import { LogOut, User, Activity } from 'lucide-react';
import './MainLayout.css';

const MainLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const role = useSelector(selectRole);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="layout-container">
            <header className="app-header">
                <div className="logo-section">
                    <Activity className="app-logo" />
                    <h1>MediVault</h1>
                </div>

                {user && (
                    <div className="user-section">
                        <span className="user-role-badge">{role === 'doctor' ? 'Dr. ' : 'Patient '}</span>
                        <span className="user-name">{user.name}</span>
                        <button onClick={handleLogout} className="logout-btn" aria-label="Logout">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </header>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
