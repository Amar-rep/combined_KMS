import { useSelector } from 'react-redux';
import { selectAllPatients } from '../features/patients/patientsSlice';
import { User, ChevronRight } from 'lucide-react';
import './PatientList.css';

const PatientList = ({ onSelectPatient, selectedPatientId }) => {
    const patients = useSelector(selectAllPatients);

    return (
        <div className="card patient-list-card">
            <div className="card-header">
                <h2 className="heading-md">My Patients</h2>
            </div>
            <div className="patient-list">
                {patients.map((patient) => (
                    <div
                        key={patient.id}
                        className={`patient-item ${selectedPatientId === patient.id ? 'selected' : ''}`}
                        onClick={() => onSelectPatient(patient)}
                    >
                        <div className="patient-avatar">
                            <User size={20} />
                        </div>
                        <div className="patient-info-compact">
                            <span className="patient-name">{patient.name}</span>
                            <span className="patient-email">{patient.email}</span>
                        </div>
                        <ChevronRight size={16} className="chevron-icon" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientList;
