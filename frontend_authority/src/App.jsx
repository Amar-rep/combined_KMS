import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PatientPage from './pages/patient/PatientPage';
import DoctorPage from './pages/doctor/DoctorPage';
import DepartmentPage from './pages/department/DepartmentPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/patient" replace />} />
                <Route path="patient" element={<PatientPage />} />
                <Route path="doctor" element={<DoctorPage />} />
                <Route path="department" element={<DepartmentPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/patient" replace />} />
        </Routes>
    );
}

export default App;
