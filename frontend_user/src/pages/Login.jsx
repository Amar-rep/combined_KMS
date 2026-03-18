import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectIsAuthenticated, selectAuthError, selectRole, selectLoading } from '../features/auth/authSlice';
import { Mail, Activity, ArrowRight, Lock, Loader2 } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [activeTab, setActiveTab] = useState('patient'); // 'patient' | 'doctor'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const role = useSelector(selectRole);
    const error = useSelector(selectAuthError);
    const loading = useSelector(selectLoading);

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
        dispatch(loginUser({ email, password, role: activeTab }));
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
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
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

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="spin-icon" size={18} />
                                <span>Logging in...</span>
                            </>
                        ) : (
                            <>
                                <span>Login as {activeTab === 'patient' ? 'Patient' : 'Doctor'}</span>
                                <ArrowRight size={18} />
                            </>
                        )}
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
