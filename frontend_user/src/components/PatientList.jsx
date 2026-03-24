import { useEffect, useState } from 'react';
import { User, ChevronRight, Loader, AlertCircle } from 'lucide-react';
import './PatientList.css';

const BASE = 'http://localhost:8083';

const PatientList = ({ onSelectPatient, selectedPatientId }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${BASE}/api/hospital/patients`);
                if (!res.ok) throw new Error(await res.text());
                setPatients(await res.json());
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    return (
        <div className="card patient-list-card">
            <div className="card-header">
                <h2 className="heading-md">My Patients</h2>
            </div>
            <div className="patient-list">
                {loading ? (
                    <div className="status-container">
                        <Loader size={18} className="spin" /> <span>Loading...</span>
                    </div>
                ) : error ? (
                    <div className="status-container error">
                        <AlertCircle size={18} /> <span>{error}</span>
                    </div>
                ) : patients.length === 0 ? (
                    <div className="status-container"><span>No patients found</span></div>
                ) : (
                    patients.map((patient) => (
                        <div
                            key={patient.id}
                            className={`patient-item ${selectedPatientId === patient.id ? 'selected' : ''}`}
                            onClick={() => onSelectPatient(patient)}
                        >
                            <div className="patient-avatar"><User size={20} /></div>
                            <div className="patient-info-compact">
                                <span className="patient-name">{patient.name}</span>
                                <span className="patient-email">{patient.email}</span>
                               
                            </div>
                            <ChevronRight size={16} className="chevron-icon" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientList;