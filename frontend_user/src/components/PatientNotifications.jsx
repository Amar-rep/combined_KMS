import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectKeccakId } from '../features/auth/authSlice';
import { Bell, AlertCircle, Loader, Building2, User, FolderOpen, Clock } from 'lucide-react';
import './PatientNotifications.css';

const BASE = 'http://localhost:8083';

const NotificationCard = ({ notification }) => (
    <div className="notification-card">
        <div className="notification-icon-wrap">
            <Bell size={18} />
        </div>
        <div className="notification-body">
            <div className="notification-row">
                <User size={13} className="meta-icon" />
                <span className="meta-label">From</span>
                <span className="meta-value mono">{notification.senderIdKeccak}</span>
            </div>
            <div className="notification-row">
                <FolderOpen size={13} className="meta-icon" />
                <span className="meta-label">Group</span>
                <span className="meta-value mono">{notification.groupId}</span>
            </div>
            <div className="notification-row">
                <Building2 size={13} className="meta-icon" />
                <span className="meta-label">Hospital</span>
                <span className="meta-value mono">{notification.hospitalId}</span>
            </div>
            {notification.timestamp && (
                <div className="notification-row">
                    <Clock size={13} className="meta-icon" />
                    <span className="meta-label">Time</span>
                    <span className="meta-value">
                        {new Date(notification.timestamp).toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    </div>
);

const PatientNotifications = () => {
    const keccakId = useSelector(selectKeccakId);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState(null);

    useEffect(() => {
        if (!keccakId) return;
        const fetch_ = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${BASE}/api/notifications/receiver/${keccakId}`);
                if (!res.ok) throw new Error(await res.text());
                setNotifications(await res.json());
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetch_();
    }, [keccakId]);

    return (
        <div className="card notifications-card">
            <div className="card-header">
                <h2 className="heading-md">Notifications</h2>
                {!loading && !error && (
                    <span className="notif-count">{notifications.length}</span>
                )}
            </div>

            <div className="notifications-container">
                {loading ? (
                    <div className="status-container">
                        <Loader size={20} className="spin" />
                        <span>Loading notifications...</span>
                    </div>
                ) : error ? (
                    <div className="status-container error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((n) => (
                        <NotificationCard key={n.id ?? n.notificationId} notification={n} />
                    ))
                ) : (
                    <div className="empty-groups">No notifications yet</div>
                )}
            </div>
        </div>
    );
};

export default PatientNotifications;