import { useState } from 'react';
import PatientList from '../components/PatientList';
import GroupList from '../components/GroupList';
import DoctorAppointments from '../components/DoctorAppointments';
import { PlusCircle, Shield, Users, CalendarDays } from 'lucide-react';
import './DoctorDashboard.css';

const TABS = [
    { key: 'patients', label: 'Patients', icon: Users },
    { key: 'appointments', label: 'Appointments', icon: CalendarDays },
];

const DoctorDashboard = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('patients');

    // Mock data for patient groups (in real app, fetch this when patient is selected)
    const mockPatientGroups = [
        {
            id: 'pg1',
            name: 'Cardiology Records',
            records: [
                { id: 'r1', name: 'Heart Scan 2023', date: '2023-01-15' },
            ]
        },
        {
            id: 'pg2',
            name: 'Lab Results',
            records: []
        }
    ];

    return (
        <div className="dashboard-containerdoctor-dashboard">
            <header className="dashboard-header">
                <h1 className="heading-lg">Doctor Dashboard</h1>
                <p className="dashboard-subtitle">Manage patients and request record access.</p>
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

            {/* ── Patients Tab ── */}
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
                                    <button className="request-access-btn">
                                        <PlusCircle size={18} />
                                        <span>Request Group Access</span>
                                    </button>
                                </div>

                                <div className="patient-content">
                                    <GroupList groups={mockPatientGroups} />
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Shield size={48} className="empty-icon" />
                                <h3 className="heading-md">Select a Patient</h3>
                                <p>Choose a patient from the list to view their records and groups.</p>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {/* ── Appointments Tab ── */}
            {activeTab === 'appointments' && <DoctorAppointments />}
        </div>
    );
};

export default DoctorDashboard;
