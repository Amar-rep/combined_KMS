import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';
import PatientInfo from '../components/PatientInfo';
import GroupList from '../components/GroupList';
import PatientAppointments from '../components/PatientAppointments';
import { LayoutDashboard, CalendarDays } from 'lucide-react';
import './PatientDashboard.css';

const TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'appointments', label: 'Appointments', icon: CalendarDays },
];

const PatientDashboard = () => {
    const user = useSelector(selectUser);
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="heading-lg">Patient Dashboard</h1>
                <p className="dashboard-subtitle">Manage your medical records and access groups.</p>
            </header>

            {/* ── Tab Navigation ── */}
            <nav className="dash-tabs">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        className={`dash-tab ${activeTab === key ? 'active' : ''}`}
                        onClick={() => setActiveTab(key)}
                    >
                        <Icon size={16} />
                        <span>{label}</span>
                    </button>
                ))}
            </nav>

            {/* ── Tab Content ── */}
            {activeTab === 'dashboard' && (
                <div className="dashboard-grid">
                    <aside className="dashboard-sidebar">
                        <PatientInfo user={user} />
                    </aside>

                    <main className="dashboard-main">
                        <GroupList />
                    </main>
                </div>
            )}

            {activeTab === 'appointments' && <PatientAppointments />}
        </div>
    );
};

export default PatientDashboard;
