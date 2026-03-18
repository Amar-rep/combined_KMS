import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectRole } from '../features/auth/authSlice';

const PrivateRoute = ({ children, allowedRoles }) => {
    const user = useSelector(selectUser);
    const role = useSelector(selectRole);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to their appropriate dashboard if they try to access a route not for them
        const redirectPath = role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default PrivateRoute;
