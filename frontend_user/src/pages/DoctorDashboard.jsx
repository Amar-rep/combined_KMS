import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectKeccakId } from '../features/auth/authSlice';
import PatientList from '../components/PatientList';
import DoctorGroupList from '../components/DoctorGroupList';
import DoctorAppointments from '../components/DoctorAppointments';
import UserWalletModal from '../components/UserWallet';          // ← NEW
import { Shield, Users, CalendarDays, Wallet } from 'lucide-react';  // ← Wallet icon
import './DoctorDashboard.css';

const TABS = [
    { key: 'patients',     label: 'Patients',     icon: Users        },
    { key: 'appointments', label: 'Appointments', icon: CalendarDays },
];

const DoctorDashboard = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activeTab, setActiveTab]             = useState('patients');
    const [walletOpen, setWalletOpen]           = useState(false);       // ← NEW
    const [walletResult, setWalletResult]       = useState(null);        // ← NEW

    const handleWalletSelect = (result) => {
        setWalletResult(result);
        setWalletOpen(false);
    };

    return (
        <div className="dashboard-container doctor-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1 className="heading-lg">Doctor Dashboard</h1>
                    <p className="dashboard-subtitle">Manage patients and request record access.</p>
                </div>

                {/* Wallet button lives in the header, always accessible */}
                <button
                    className="btn btn-secondary wallet-header-btn"
                    onClick={() => setWalletOpen(true)}
                >
                    <Wallet size={16} />
                    <span>Wallet</span>
                </button>
            </header>

            <nav className="dash-tabs">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        className={`dash-tab ${activeTab === key ? 'active' : ''}`}
                        onClick={() => setActiveTab(key)}
                    >
                        <Icon size={16} /><span>{label}</span>
                    </button>
                ))}
            </nav>

            {activeTab === 'patients' && (
                <div className="doctor-grid">
                    <aside className="doctor-sidebar">
                        <PatientList
                            onSelectPatient={setSelectedPatient}
                            selectedPatientId={selectedPatient?.id}
                        />
                    </aside>

                    <main className="doctor-main">
                        {selectedPatient ? (
                            <div className="patient-view">
                                <div className="patient-view-header">
                                    <div>
                                        <h2 className="heading-md">{selectedPatient.name}</h2>
                                        <span className="patient-id">ID: {selectedPatient.id}</span>
                                    </div>
                                </div>

                                <div className="patient-content">
                                    <DoctorGroupList patientKeccak={selectedPatient.patientIdKeccak} />
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Shield size={48} className="empty-icon" />
                                <h3 className="heading-md">Select a Patient</h3>
                                <p>Choose a patient from the list to view their records and request group access.</p>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {activeTab === 'appointments' && <DoctorAppointments />}

            {/* Wallet modal — rendered at root level so it overlays everything */}
            <UserWalletModal
                isOpen={walletOpen}
                onClose={() => setWalletOpen(false)}
                onSelect={handleWalletSelect}
            />
        </div>
    );
};

export default DoctorDashboard;