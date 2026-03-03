import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectIsAuthenticated, selectAuthError, selectRole } from '../features/auth/authSlice';
import { User, Activity, ArrowRight, Lock } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [activeTab, setActiveTab] = useState('patient'); // 'patient' | 'doctor'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const role = useSelector(selectRole);
    const error = useSelector(selectAuthError);

    useEffect(() => {
        if (isAuthenticated) {
            if (role === 'doctor') {
                navigate('/doctor-dashboard');
            } else {
                navigate('/patient-dashboard');
            }
        }
    }, [isAuthenticated, role, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login({ username, password, role: activeTab }));
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-icon-wrapper">
                        <Activity className="logo-icon" size={32} />
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Secure access to your health records</p>
                </div>

                <div className="role-switch">
                    <button
                        className={`role-btn ${activeTab === 'patient' ? 'active' : ''}`}
                        onClick={() => setActiveTab('patient')}
                    >
                        Patient
                    </button>
                    <button
                        className={`role-btn ${activeTab === 'doctor' ? 'active' : ''}`}
                        onClick={() => setActiveTab('doctor')}
                    >
                        Doctor
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={18} />
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={activeTab === 'patient' ? 'patient1' : 'doctor1'}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="submit-btn">
                        <span>Login as {activeTab === 'patient' ? 'Patient' : 'Doctor'}</span>
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="login-footer">
                    <p>Protected by end-to-end encryption</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
