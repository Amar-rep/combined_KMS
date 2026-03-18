import { User, Mail, Hash } from 'lucide-react';
import './PatientInfo.css';

const PatientInfo = ({ user }) => {
    if (!user) return null;

    return (
        <div className="card patient-info-card">
            <div className="info-header">
                <div className="avatar-placeholder">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h2 className="heading-md">{user.name}</h2>
                    <span className="role-tag">Patient</span>
                </div>
            </div>

            <div className="info-details">
                <div className="detail-item">
                    <Mail size={16} className="detail-icon" />
                    <span>{user.email}</span>
                </div>
                <div className="detail-item">
                    <Hash size={16} className="detail-icon" />
                    <span>ID: {user.id}</span>
                </div>
            </div>
        </div>
    );
};

export default PatientInfo;
