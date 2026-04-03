import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectDoctorKeccakId } from '../features/auth/authSlice';
import {
    Bell, AlertCircle, Loader, Building2, User,
    FolderOpen, Clock, CheckCircle2, RefreshCw
} from 'lucide-react';
import './DoctorNotifications.css';

const BASE = 'http://localhost:8083';
const DEFAULT_HOSPITAL_ID = 'bJwqraIk3w';

const NotifCard = ({ n }) => {
    const isAccepted = (n.status ?? '').toUpperCase().startsWith('ACCEPT');

    return (
        <div className={`dn-card ${isAccepted ? 'dn-accepted' : ''}`}>
            <div className={`dn-icon-wrap ${isAccepted ? 'dn-icon-green' : ''}`}>
                {isAccepted ? <CheckCircle2 size={18} /> : <Bell size={18} />}
            </div>

            <div className="dn-body">
                <span className={`dn-badge ${isAccepted ? 'dn-badge-green' : 'dn-badge-amber'}`}>
                    {isAccepted ? 'Accepted' : 'Pending'}
                </span>

                <div className="dn-row">
                    <User size={13} className="dn-meta-icon" />
                    <span className="dn-meta-label">Patient</span>
                    <span className="dn-meta-value mono">{n.receiverIdKeccak}</span>
                </div>
                <div className="dn-row">
                    <FolderOpen size={13} className="dn-meta-icon" />
                    <span className="dn-meta-label">Group</span>
                    <span className="dn-meta-value mono">{n.groupId}</span>
                </div>
                <div className="dn-row">
                    <Building2 size={13} className="dn-meta-icon" />
                    <span className="dn-meta-label">Hospital</span>
                    <span className="dn-meta-value mono">{n.hospitalId}</span>
                </div>
                {(n.createdAt || n.timestamp) && (
                    <div className="dn-row">
                        <Clock size={13} className="dn-meta-icon" />
                        <span className="dn-meta-label">Time</span>
                        <span className="dn-meta-value">
                            {new Date(n.createdAt ?? n.timestamp).toLocaleString()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

const DoctorNotifications = () => {
    const doctorKeccak = useSelector(selectDoctorKeccakId);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState(null);

    const fetchNotifs = useCallback(async () => {
        if (!doctorKeccak) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `${BASE}/api/notifications/sender/${doctorKeccak}/hospital/${DEFAULT_HOSPITAL_ID}`
            );
            if (!res.ok) throw new Error(await res.text());
            const list = await res.json();
            // accepted first, then newest first within each group
            list.sort((a, b) => {
                const aa = (a.status ?? '').toUpperCase().startsWith('ACCEPT') ? 0 : 1;
                const ba = (b.status ?? '').toUpperCase().startsWith('ACCEPT') ? 0 : 1;
                if (aa !== ba) return aa - ba;
                return new Date(b.createdAt ?? b.timestamp ?? 0) - new Date(a.createdAt ?? a.timestamp ?? 0);
            });
            setNotifications(list);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [doctorKeccak]);

    useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

    const acceptedCount = notifications.filter(n => (n.status ?? '').toUpperCase().startsWith('ACCEPT')).length;
    const pendingCount  = notifications.length - acceptedCount;

    return (
        <div className="card dn-card-root">
            <div className="card-header dn-header">
                <h2 className="heading-md">Sent Notifications</h2>
                <div className="dn-header-right">
                    <div className="dn-counts">
                        {pendingCount > 0 && <span className="dn-pill dn-pill-amber">{pendingCount} pending</span>}
                        {acceptedCount > 0 && <span className="dn-pill dn-pill-green">{acceptedCount} accepted</span>}
                    </div>
                    <button className="dn-refresh" onClick={fetchNotifs} disabled={loading} title="Refresh">
                        <RefreshCw size={15} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="dn-list">
                {loading ? (
                    <div className="dn-status">
                        <Loader size={20} className="spin" />
                        <span>Loading…</span>
                    </div>
                ) : error ? (
                    <div className="dn-status dn-error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((n) => (
                        <NotifCard key={n.id ?? n.notificationId} n={n} />
                    ))
                ) : (
                    <div className="dn-empty">No notifications sent yet</div>
                )}
            </div>
        </div>
    );
};

export default DoctorNotifications;
