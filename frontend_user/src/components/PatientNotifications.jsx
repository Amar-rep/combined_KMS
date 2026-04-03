import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectKeccakId } from '../features/auth/authSlice';
import {
    Bell, AlertCircle, Loader, Building2, User,
    FolderOpen, Clock, CheckCircle2, ShieldCheck, KeyRound, Save, Trash2
} from 'lucide-react';
import './PatientNotifications.css';

const BASE = 'http://localhost:8083';
const DEFAULT_HOSPITAL_ID = 'bJwqraIk3w';
const SIG_STORAGE_KEY = 'patient_signature_base64';

/* ─────────────────────────────────────────────────────────
   Simple Signature Store — patient manually enters their
   pre-computed SignatureBase64, stored in localStorage
   ───────────────────────────────────────────────────────── */
const SignatureWallet = () => {
    const [saved, setSaved]     = useState(() => localStorage.getItem(SIG_STORAGE_KEY) || '');
    const [draft, setDraft]     = useState('');
    const [editing, setEditing] = useState(!saved);

    const handleSave = () => {
        const trimmed = draft.trim();
        if (!trimmed) return;
        localStorage.setItem(SIG_STORAGE_KEY, trimmed);
        setSaved(trimmed);
        setEditing(false);
    };

    const handleClear = () => {
        localStorage.removeItem(SIG_STORAGE_KEY);
        setSaved('');
        setDraft('');
        setEditing(true);
    };

    return (
        <div className="sig-wallet">
            <div className="sig-wallet-header">
                <KeyRound size={15} />
                <span className="sig-wallet-title">Patient Signature Wallet</span>
            </div>

            {!editing && saved ? (
                <div className="sig-wallet-saved">
                    <div className="sig-preview">
                        <span className="sig-label">Stored Signature</span>
                        <code className="sig-value">{saved.slice(0, 40)}…</code>
                    </div>
                    <div className="sig-wallet-actions">
                        <button className="sig-btn-edit" onClick={() => { setDraft(saved); setEditing(true); }}>
                            Edit
                        </button>
                        <button className="sig-btn-clear" onClick={handleClear}>
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="sig-wallet-form">
                    <textarea
                        className="sig-textarea"
                        rows={3}
                        placeholder="Paste your Signature Base64 here…"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                    />
                    <button
                        className="sig-btn-save"
                        onClick={handleSave}
                        disabled={!draft.trim()}
                    >
                        <Save size={14} /> Save Signature
                    </button>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────
   Notification Card
   ───────────────────────────────────────────────────── */
const NotificationCard = ({ notification, patientKeccak, onRefresh }) => {
    const [busy, setBusy]   = useState(false);
    const [err, setErr]     = useState(null);
    const isAccepted = (notification.status ?? '').toUpperCase().startsWith('ACCEPT');

    const handleAccept = async () => {
        const signature = localStorage.getItem(SIG_STORAGE_KEY);
        if (!signature) {
            setErr('No signature stored. Please save your Signature Base64 in the wallet above first.');
            return;
        }
        setBusy(true);
        setErr(null);
        try {
            const res = await fetch(`${BASE}/api/documents/access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_keccak:   patientKeccak,
                    hospital_id:     notification.hospitalId ?? DEFAULT_HOSPITAL_ID,
                    receiver_keccak: notification.senderIdKeccak,
                    notificationId:  notification.id,
                    groupId:         notification.groupId,
                    nonce:           'nonce',
                    signature,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            onRefresh();
        } catch (e) {
            setErr(e.message || 'Failed to grant access');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={`notification-card ${isAccepted ? 'n-accepted' : ''}`}>
            <div className={`notification-icon-wrap ${isAccepted ? 'icon-accepted' : ''}`}>
                {isAccepted ? <CheckCircle2 size={18} /> : <Bell size={18} />}
            </div>

            <div className="notification-body">
                <span className={`n-badge ${isAccepted ? 'badge-green' : 'badge-amber'}`}>
                    {isAccepted ? 'Accepted' : 'Pending'}
                </span>

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
                {(notification.createdAt || notification.timestamp) && (
                    <div className="notification-row">
                        <Clock size={13} className="meta-icon" />
                        <span className="meta-label">Time</span>
                        <span className="meta-value">
                            {new Date(notification.createdAt ?? notification.timestamp).toLocaleString()}
                        </span>
                    </div>
                )}

                {!isAccepted && (
                    <button className="btn-accept" onClick={handleAccept} disabled={busy}>
                        {busy
                            ? <><Loader size={14} className="spin" /> Accepting…</>
                            : <><ShieldCheck size={14} /> Accept &amp; Grant Access</>}
                    </button>
                )}

                {err && (
                    <div className="notif-inline-error">
                        <AlertCircle size={13} /> {err}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────── */
const PatientNotifications = () => {
    const keccakId = useSelector(selectKeccakId);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState(null);

    const fetchAll = useCallback(async () => {
        if (!keccakId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE}/api/notifications/receiver/${keccakId}`);
            if (!res.ok) throw new Error(await res.text());
            const list = await res.json();
            list.sort((a, b) => {
                const aa = (a.status ?? '').toUpperCase().startsWith('ACCEPT') ? 1 : 0;
                const ba = (b.status ?? '').toUpperCase().startsWith('ACCEPT') ? 1 : 0;
                if (aa !== ba) return aa - ba;
                return new Date(b.createdAt ?? b.timestamp ?? 0) - new Date(a.createdAt ?? a.timestamp ?? 0);
            });
            setNotifications(list);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [keccakId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const pendingCount  = notifications.filter(n => !(n.status ?? '').toUpperCase().startsWith('ACCEPT')).length;
    const acceptedCount = notifications.filter(n => (n.status ?? '').toUpperCase().startsWith('ACCEPT')).length;

    return (
        <div className="card notifications-card">
            <div className="card-header">
                <h2 className="heading-md">Notifications</h2>
                {!loading && !error && (
                    <div className="notif-counts">
                        {pendingCount > 0 && <span className="notif-pill pill-amber">{pendingCount} pending</span>}
                        {acceptedCount > 0 && <span className="notif-pill pill-green">{acceptedCount} accepted</span>}
                    </div>
                )}
            </div>

            {/* Simple signature wallet at the top */}
            <SignatureWallet />

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
                    notifications.map((n) => (
                        <NotificationCard
                            key={n.id ?? n.notificationId}
                            notification={n}
                            patientKeccak={keccakId}
                            onRefresh={fetchAll}
                        />
                    ))
                ) : (
                    <div className="empty-groups">No notifications yet</div>
                )}
            </div>
        </div>
    );
};

export default PatientNotifications;