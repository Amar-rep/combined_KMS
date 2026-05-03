import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectKeccakId } from '../features/auth/authSlice';
import { Bell, AlertCircle, Loader, Building2, User, FolderOpen, Clock, CheckCircle, XCircle } from 'lucide-react';
import UserWallet from './UserWallet';
import './PatientNotifications.css';

const BASE = 'http://localhost:8083';

/* ─── Notification Card ─── */
const NotificationCard = ({ notification, isAccepted, isRejected, isProcessing, isRejecting, actionError, onAcceptClick, onRejectClick }) => {
    const [senderInfo, setSenderInfo] = useState(notification.senderIdKeccak);
    const [groupInfo, setGroupInfo] = useState(notification.groupId);
    const [isSenderResolved, setIsSenderResolved] = useState(false);
    const [isGroupResolved, setIsGroupResolved] = useState(false);

    useEffect(() => {
        // Fetch group details
        fetch(`${BASE}/api/hospital/groups/group-id/${notification.groupId}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.name) {
                    setGroupInfo(data.name);
                    setIsGroupResolved(true);
                }
            })
            .catch(() => { });

        // Fetch sender (doctor) details
        fetch(`${BASE}/api/hospital/doctors/keccak/${notification.senderIdKeccak}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.name) {
                    setSenderInfo(`Dr. ${data.name}`);
                    setIsSenderResolved(true);
                }
            })
            .catch(() => { });
    }, [notification.groupId, notification.senderIdKeccak]);

    const formatId = (id) => {
        if (!id || id.length < 15) return id;
        return `${id.substring(0, 8)}...${id.substring(id.length - 6)}`;
    };

    const isAnyActionProcessing = isProcessing || isRejecting;

    return (
        <div className={`notification-card ${isAccepted ? 'accepted' : isRejected ? 'rejected' : ''}`}>
            <div className="notification-icon-wrap">
                {isAccepted ? <CheckCircle size={22} /> : isRejected ? <XCircle size={22} /> : <Bell size={22} />}
            </div>
            <div className="notification-body">
                <div className="notification-header-row">
                    <h3 className="notification-title">
                        {isSenderResolved ? senderInfo : 'Unknown Sender'} requests access
                    </h3>
                    {notification.timestamp && (
                        <div className="notification-time">
                            <Clock size={12} />
                            {new Date(notification.timestamp).toLocaleDateString()}
                        </div>
                    )}
                </div>

                <div className="notification-details-grid">
                    <div className="detail-pill" title={`Sender ID: ${notification.senderIdKeccak}`}>
                        <User size={12} className="meta-icon" />
                        <span className={isSenderResolved ? 'meta-text' : 'meta-text mono'}>
                            {isSenderResolved ? senderInfo : formatId(notification.senderIdKeccak)}
                        </span>
                    </div>
                    <div className="detail-pill" title={`Group ID: ${notification.groupId}`}>
                        <FolderOpen size={12} className="meta-icon" />
                        <span className={isGroupResolved ? 'meta-text' : 'meta-text mono'}>
                            {isGroupResolved ? groupInfo : formatId(notification.groupId)}
                        </span>
                    </div>
                    <div className="detail-pill" title={`Hospital ID: ${notification.hospitalId}`}>
                        <Building2 size={12} className="meta-icon" />
                        <span className="meta-text mono">
                            {formatId(notification.hospitalId)}
                        </span>
                    </div>
                </div>

                <div className="notification-actions-row">
                    {isAccepted ? (
                        <span className="accepted-badge">
                            <CheckCircle size={14} /> Access Granted
                        </span>
                    ) : isRejected ? (
                        <span className="rejected-badge">
                            <XCircle size={14} /> Access Rejected
                        </span>
                    ) : (
                        <div className="action-button-group">
                            <div className="action-buttons-row">
                                <button
                                    className="btn-accept-glow"
                                    onClick={() => onAcceptClick(notification)}
                                    disabled={isAnyActionProcessing}
                                >
                                    {isProcessing ? (
                                        <><Loader size={14} className="spin" /> Processing...</>
                                    ) : (
                                        'Grant Access'
                                    )}
                                </button>
                                <button
                                    className="btn-reject"
                                    onClick={() => onRejectClick(notification)}
                                    disabled={isAnyActionProcessing}
                                >
                                    {isRejecting ? '...' : 'Reject'}
                                </button>
                            </div>
                            {actionError && <div className="accept-error">{actionError}</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─── Main Component ─── */
const PatientNotifications = () => {
    const keccakId = useSelector(selectKeccakId);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Wallet & accept state
    const [walletOpen, setWalletOpen] = useState(false);
    const [activeNotification, setActiveNotification] = useState(null);
    const [actionProcessing, setActionProcessing] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [acceptedIds, setAcceptedIds] = useState(new Set());
    const [rejectedIds, setRejectedIds] = useState(new Set());
    const [rejectProcessingFor, setRejectProcessingFor] = useState(null);

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

    const handleAcceptClick = (notification) => {
        setActiveNotification(notification);
        setActionError(null);
        setWalletOpen(true);
    };

    const handleRejectClick = async (notification) => {
        const notifId = notification.id ?? notification.notificationId;
        setRejectProcessingFor(notifId);
        setActiveNotification(notification); // To show error locally on the card
        setActionError(null);

        try {
            const res = await fetch(`${BASE}/api/notifications/${notifId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'text/plain' },
                body: "reject",
            });

            if (!res.ok) throw new Error(await res.text());

            setRejectedIds((prev) => new Set(prev).add(notifId));
        } catch (err) {
            setActionError(err.message || 'Failed to reject notification');
        } finally {
            setRejectProcessingFor(null);
        }
    };

    const handleWalletSelect = async (walletResult) => {
        setWalletOpen(false);
        if (!walletResult || !activeNotification) return;

        setActionProcessing(true);
        setActionError(null);

        try {
            // Convert hex signature from wallet → base64
            const signatureHex = walletResult;
            const hexStr = signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex;
            const sigBytes = new Uint8Array(hexStr.match(/.{2}/g).map((b) => parseInt(b, 16)));
            const signatureBase64 = btoa(String.fromCharCode(...sigBytes));

            const payload = {
                sender_keccak: keccakId,
                hospital_id: activeNotification.hospitalId,
                receiver_keccak: activeNotification.senderIdKeccak,
                notificationId: activeNotification.id ?? activeNotification.notificationId,
                groupId: activeNotification.groupId,
                nonce: "nonce",
                signature: signatureBase64,
            };

            const res = await fetch(`${BASE}/api/documents/access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(await res.text());

            // Immediately sync group access after granting access
            await fetch(`${BASE}/api/group-access/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hospitalId: activeNotification.hospitalId }),
            }).catch(e => console.error("Failed to sync group access", e));

            // Mark as accepted locally
            setAcceptedIds((prev) => new Set(prev).add(activeNotification.id ?? activeNotification.notificationId));
        } catch (err) {
            setActionError(err.message || 'Failed to accept notification');
        } finally {
            setActionProcessing(false);
            // activeNotification is intentionally not cleared so that `actionError` matches the right card,
            // but for simplicity we rely on activeNotification mapping in the render loop.
        }
    };

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
                        <span>Loading notifications…</span>
                    </div>
                ) : error ? (
                    <div className="status-container error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((n) => {
                        const notifId = n.id ?? n.notificationId;
                        const isActive = activeNotification && (activeNotification.id ?? activeNotification.notificationId) === notifId;
                        return (
                            <NotificationCard
                                key={notifId}
                                notification={n}
                                isAccepted={n.status === 'accept' || acceptedIds.has(notifId)}
                                isRejected={n.status === 'reject' || n.status === 'rejected' || rejectedIds.has(notifId)}
                                isProcessing={isActive && actionProcessing}
                                isRejecting={rejectProcessingFor === notifId}
                                actionError={isActive ? actionError : null}
                                onAcceptClick={handleAcceptClick}
                                onRejectClick={handleRejectClick}
                            />
                        );
                    })
                ) : (
                    <div className="empty-groups">No notifications yet</div>
                )}
            </div>

            <UserWallet
                isOpen={walletOpen}
                onClose={() => setWalletOpen(false)}
                onSelect={handleWalletSelect}
                defaultAction="signTransaction"
                defaultNonce="nonce"
            />
        </div>
    );
};

export default PatientNotifications;