import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectKeccakId } from '../features/auth/authSlice';
import {
    Bell, AlertCircle, Loader, Building2, User,
    FolderOpen, Clock, CheckCircle2, ShieldCheck, ShieldX,
    KeyRound, Save, Trash2
} from 'lucide-react';
import './PatientNotifications.css';

const BASE = 'http://localhost:8083';
const DEFAULT_HOSPITAL_ID = 'bJwqraIk3w';
const SIG_STORAGE_KEY = 'patient_signature_base64';

/* ── helpers ── */
const isAccepted = (s) => (s ?? '').toUpperCase().startsWith('ACCEPT');
const isRevoked  = (s) => (s ?? '').toUpperCase().startsWith('REVOKE');

/* ─────────────────────────────────────────────────────
   Signature Wallet
   ───────────────────────────────────────────────────── */
const SignatureWallet = () => {
    const [saved, setSaved]     = useState(() => localStorage.getItem(SIG_STORAGE_KEY) || '');
    const [draft, setDraft]     = useState('');
    const [editing, setEditing] = useState(!saved);

    const handleSave = () => {
        const t = draft.trim();
        if (!t) return;
        localStorage.setItem(SIG_STORAGE_KEY, t);
        setSaved(t);
        setEditing(false);
    };
    const handleClear = () => {
        localStorage.removeItem(SIG_STORAGE_KEY);
        setSaved(''); setDraft(''); setEditing(true);
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
                        <button className="sig-btn-edit" onClick={() => { setDraft(saved); setEditing(true); }}>Edit</button>
                        <button className="sig-btn-clear" onClick={handleClear}><Trash2 size={13} /></button>
                    </div>
                </div>
            ) : (
                <div className="sig-wallet-form">
                    <textarea className="sig-textarea" rows={3} placeholder="Paste your Signature Base64 here…"
                        value={draft} onChange={(e) => setDraft(e.target.value)} />
                    <button className="sig-btn-save" onClick={handleSave} disabled={!draft.trim()}>
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
    const [busy, setBusy]       = useState(false);
    const [revoking, setRevoking] = useState(false);
    const [err, setErr]         = useState(null);
    const accepted = isAccepted(notification.status);
    const revoked  = isRevoked(notification.status);

    const handleAccept = async () => {
        const signature = localStorage.getItem(SIG_STORAGE_KEY);
        if (!signature) { setErr('Save your signature first.'); return; }
        setBusy(true); setErr(null);
        try {
            const res = await fetch(`${BASE}/api/documents/access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_keccak: patientKeccak,
                    hospital_id: notification.hospitalId ?? DEFAULT_HOSPITAL_ID,
                    receiver_keccak: notification.senderIdKeccak,
                    notificationId: notification.id,
                    groupId: notification.groupId,
                    nonce: 'nonce',
                    signature,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            onRefresh();
        } catch (e) { setErr(e.message); } finally { setBusy(false); }
    };

    const handleRevoke = async () => {
        const signature = localStorage.getItem(SIG_STORAGE_KEY);
        if (!signature) { setErr('Save your signature first.'); return; }
        setRevoking(true); setErr(null);
        try {
            // 1. Call revoke-access API
            const res1 = await fetch(`${BASE}/api/documents/revoke-access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_keccak: patientKeccak,
                    groupId: notification.groupId,
                    nonce: 'nonce',
                    signature,
                }),
            });
            if (!res1.ok) throw new Error(await res1.text());

            // 2. Update notification status to 'revoke'
            const res2 = await fetch(`${BASE}/api/notifications/${notification.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'text/plain' },
                body: 'revoke',
            });
            if (!res2.ok) throw new Error(await res2.text());

            onRefresh();
        } catch (e) { setErr(e.message); } finally { setRevoking(false); }
    };

    // Badge color
    const badgeClass = revoked ? 'badge-red' : accepted ? 'badge-green' : 'badge-amber';
    const badgeText  = revoked ? 'Revoked' : accepted ? 'Accepted' : 'Pending';
    const iconClass  = revoked ? 'icon-revoked' : accepted ? 'icon-accepted' : '';

    return (
        <div className={`notification-card ${accepted ? 'n-accepted' : ''} ${revoked ? 'n-revoked' : ''}`}>
            <div className={`notification-icon-wrap ${iconClass}`}>
                {revoked ? <ShieldX size={18} /> : accepted ? <CheckCircle2 size={18} /> : <Bell size={18} />}
            </div>
            <div className="notification-body">
                <span className={`n-badge ${badgeClass}`}>{badgeText}</span>

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

                {/* Pending or Revoked → Accept */}
                {!accepted && (
                    <button className="btn-accept" onClick={handleAccept} disabled={busy}>
                        {busy ? <><Loader size={14} className="spin" /> Accepting…</>
                             : <><ShieldCheck size={14} /> Accept &amp; Grant Access</>}
                    </button>
                )}

                {/* Accepted → Revoke */}
                {accepted && !revoked && (
                    <button className="btn-revoke" onClick={handleRevoke} disabled={revoking}>
                        {revoking ? <><Loader size={14} className="spin" /> Revoking…</>
                                  : <><ShieldX size={14} /> Revoke Access</>}
                    </button>
                )}

                {err && (
                    <div className="notif-inline-error"><AlertCircle size={13} /> {err}</div>
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
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    const fetchAll = useCallback(async () => {
        if (!keccakId) return;
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${BASE}/api/notifications/receiver/${keccakId}`);
            if (!res.ok) throw new Error(await res.text());
            const list = await res.json();
            // pending first, then accepted, then revoked
            list.sort((a, b) => {
                const order = (s) => isRevoked(s) ? 2 : isAccepted(s) ? 1 : 0;
                const diff = order(a.status) - order(b.status);
                if (diff !== 0) return diff;
                return new Date(b.createdAt ?? b.timestamp ?? 0) - new Date(a.createdAt ?? a.timestamp ?? 0);
            });
            setNotifications(list);
        } catch (e) { setError(e.message); } finally { setLoading(false); }
    }, [keccakId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const pendingCount  = notifications.filter(n => !isAccepted(n.status) && !isRevoked(n.status)).length;
    const acceptedCount = notifications.filter(n => isAccepted(n.status)).length;
    const revokedCount  = notifications.filter(n => isRevoked(n.status)).length;

    return (
        <div className="card notifications-card">
            <div className="card-header">
                <h2 className="heading-md">Notifications</h2>
                {!loading && !error && (
                    <div className="notif-counts">
                        {pendingCount > 0 && <span className="notif-pill pill-amber">{pendingCount} pending</span>}
                        {acceptedCount > 0 && <span className="notif-pill pill-green">{acceptedCount} accepted</span>}
                        {revokedCount > 0 && <span className="notif-pill pill-red">{revokedCount} revoked</span>}
                    </div>
                )}
            </div>
            <SignatureWallet />
            <div className="notifications-container">
                {loading ? (
                    <div className="status-container"><Loader size={20} className="spin" /> <span>Loading…</span></div>
                ) : error ? (
                    <div className="status-container error"><AlertCircle size={20} /> <span>{error}</span></div>
                ) : notifications.length > 0 ? (
                    notifications.map((n) => (
                        <NotificationCard key={n.id ?? n.notificationId} notification={n}
                            patientKeccak={keccakId} onRefresh={fetchAll} />
                    ))
                ) : (
                    <div className="empty-groups">No notifications yet</div>
                )}
            </div>
        </div>
    );
};

export default PatientNotifications;