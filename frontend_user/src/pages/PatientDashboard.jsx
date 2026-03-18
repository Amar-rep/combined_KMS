import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';
import PatientInfo from '../components/PatientInfo';
import GroupList from '../components/GroupList';
import './PatientDashboard.css';

const PatientDashboard = () => {
    const user = useSelector(selectUser);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="heading-lg">Patient Dashboard</h1>
                <p className="dashboard-subtitle">Manage your medical records and access groups.</p>
            </header>

            <div className="dashboard-grid">
                <aside className="dashboard-sidebar">
                    <PatientInfo user={user} />
                </aside>

                <main className="dashboard-main">
                    <GroupList />
                </main>
            </div>
        </div>
    );
};

export default PatientDashboard;
