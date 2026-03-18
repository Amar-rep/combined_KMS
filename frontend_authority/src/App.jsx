import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PatientPage from './pages/patient/PatientPage';
import DoctorPage from './pages/doctor/DoctorPage';
import DepartmentPage from './pages/department/DepartmentPage';
import LoginPage from './pages/login/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/patient" replace />} />
                <Route path="patient" element={<PatientPage />} />
                <Route path="doctor" element={<DoctorPage />} />
                <Route path="department" element={<DepartmentPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
