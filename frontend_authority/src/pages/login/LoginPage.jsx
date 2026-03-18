import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../../api/api';
import './LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/authority/login', { username, password });
            login(res.data);
            navigate('/', { replace: true });
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Invalid username or password');
            } else {
                setError('Unable to connect to server. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Animated background blobs */}
            <div className="login-bg-blob login-bg-blob-1" />
            <div className="login-bg-blob login-bg-blob-2" />
            <div className="login-bg-blob login-bg-blob-3" />

            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo-ring">
                        <Activity size={32} />
                    </div>
                    <h1 className="login-title">MediVault</h1>
                    <p className="login-subtitle">Authority Console</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit} id="authority-login-form">
                    {error && (
                        <div className="login-error" id="login-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="login-field">
                        <label htmlFor="username">Username</label>
                        <div className="login-input-wrapper">
                            <User size={18} className="login-input-icon" />
                            <input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Password</label>
                        <div className="login-input-wrapper">
                            <Lock size={18} className="login-input-icon" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="login-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-submit-btn"
                        disabled={loading}
                        id="login-submit-btn"
                    >
                        {loading ? (
                            <span className="login-spinner" />
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="login-footer-text">
                    Authorized personnel only
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
