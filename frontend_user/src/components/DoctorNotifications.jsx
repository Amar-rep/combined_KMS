import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectDoctorKeccakId } from '../features/auth/authSlice';
import {
    Bell, AlertCircle, Loader, Building2, User, FolderOpen,
    Clock, CheckCircle2, RefreshCw, ChevronDown, ChevronUp,
    FileText, Upload, ShieldX, X
} from 'lucide-react';
import './DoctorNotifications.css';
import './DoctorGroupRecords.css';

const BASE = 'http://localhost:8083';
const DEFAULT_HOSPITAL_ID = 'bJwqraIk3w';

const isAccepted = (s) => (s ?? '').toUpperCase().startsWith('ACCEPT');
const isRevoked  = (s) => (s ?? '').toUpperCase().startsWith('REVOKE');

/* ── Records Panel (shown inside accepted notification dropdown) ── */
const GroupRecordsPanel = ({ groupId, patientKeccak, doctorKeccak }) => {
    const [records, setRecords]   = useState([]);
    const [loading, setLoading]   = useState(false);
    const [file, setFile]         = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError]       = useState(null);
    const [viewingRecord, setViewingRecord] = useState(null);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE}/api/new-records/group/${groupId}`);
            if (!res.ok) throw new Error(await res.text());
            setRecords(await res.json());
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, [groupId]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true); setError(null);
        try {
            const reader = new FileReader();
            const base64 = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result.split(',')[1] || reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const res = await fetch(`${BASE}/api/new-records`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId,
                    patientKeccak,
                    doctorKeccak,
                    fileName: file.name,
                    fileType: file.type || 'application/octet-stream',
                    fileSize: file.size,
                    fileData: base64,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            setFile(null);
            await fetchRecords();
        } catch (e) { setError(e.message); }
        finally { setUploading(false); }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const handleView = async (e, r) => {
        e.stopPropagation();
        if (!r.fileData) {
            alert('File data is empty or not available.');
            return;
        }
        setViewingRecord({ fileName: r.fileName, fileType: r.fileType || 'application/octet-stream', url: null });
        try {
            let dataUri = r.fileData;
            if (!dataUri.startsWith('data:')) {
                const mime = r.fileType || 'application/octet-stream';
                const cleanBase64 = dataUri.replace(/\s/g, '');
                dataUri = `data:${mime};base64,${cleanBase64}`;
            }

            const res = await fetch(dataUri);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            setViewingRecord({ fileName: r.fileName, fileType: r.fileType || 'application/octet-stream', url, _blobUrl: url });
        } catch (err) {
            console.error('Error viewing file:', err);
            setViewingRecord(null);
            alert('Failed to load document preview.');
        }
    };

    const closeView = () => {
        if (viewingRecord?._blobUrl) window.URL.revokeObjectURL(viewingRecord._blobUrl);
        setViewingRecord(null);
    };

    return (
        <div className="grp-panel">
            {/* Modal Overlay */}
            {viewingRecord && (
                <div className="doc-modal-overlay" onClick={closeView}>
                    <div className="doc-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="doc-modal-header">
                            <h3 className="doc-modal-title"><FileText size={16} /> {viewingRecord.fileName}</h3>
                            <button className="doc-modal-close" onClick={closeView}><X size={20} /></button>
                        </div>
                        <div className="doc-modal-body" onContextMenu={(e) => e.preventDefault()}>
                            {viewingRecord.url ? (
                                viewingRecord.fileType.startsWith('image/') ? (
                                    <img src={viewingRecord.url} alt={viewingRecord.fileName} />
                                ) : (
                                    <iframe src={viewingRecord.url + '#toolbar=0&navpanes=0'} title="Document Preview" sandbox="allow-scripts allow-same-origin" />
                                )
                            ) : (
                                <div className="doc-modal-loading"><Loader className="spin" size={30} /></div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Upload form */}
            <div className="grp-upload-row">
                <label className="grp-file-label">
                    <Upload size={14} />
                    <span>{file ? file.name : 'Choose file…'}</span>
                    <input type="file" className="grp-file-input" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
                <button className="grp-upload-btn" onClick={handleUpload} disabled={!file || uploading}>
                    {uploading ? <Loader size={14} className="spin" /> : <Upload size={14} />}
                    <span>{uploading ? 'Uploading…' : 'Upload'}</span>
                </button>
            </div>

            {error && <div className="grp-error"><AlertCircle size={13} /> {error}</div>}

            {/* Records list */}
            {loading ? (
                <div className="grp-loading"><Loader size={16} className="spin" /> Loading records…</div>
            ) : records.length > 0 ? (
                <div className="grp-records-list">
                    {records.map((r) => (
                        <div key={r.id} className="grp-record-item" onClick={(e) => handleView(e, r)} title="Click to view">
                            <FileText size={15} className="grp-rec-icon" />
                            <div className="grp-rec-info">
                                <span className="grp-rec-name">{r.fileName}</span>
                                <span className="grp-rec-meta">
                                    {r.fileType} · {formatSize(r.fileSize)}
                                    {r.uploadedAt && <> · {new Date(r.uploadedAt).toLocaleDateString()}</>}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grp-empty">No records yet. Upload a file above.</div>
            )}
        </div>
    );
};

/* ── Notification Card ── */
const NotifCard = ({ n, doctorKeccak }) => {
    const accepted = isAccepted(n.status);
    const revoked  = isRevoked(n.status);
    const [open, setOpen] = useState(false);

    const badgeClass = revoked ? 'dn-badge-red' : accepted ? 'dn-badge-green' : 'dn-badge-amber';
    const badgeText  = revoked ? 'Revoked' : accepted ? 'Accepted' : 'Pending';

    return (
        <div className={`dn-card ${accepted ? 'dn-accepted' : ''} ${revoked ? 'dn-revoked' : ''}`}>
            <div className={`dn-icon-wrap ${revoked ? 'dn-icon-red' : accepted ? 'dn-icon-green' : ''}`}>
                {revoked ? <ShieldX size={18} /> : accepted ? <CheckCircle2 size={18} /> : <Bell size={18} />}
            </div>

            <div className="dn-body">
                <div className="dn-top-row">
                    <span className={`dn-badge ${badgeClass}`}>{badgeText}</span>
                    {/* Only accepted (not revoked) groups can be expanded */}
                    {accepted && !revoked && (
                        <button className="dn-expand-btn" onClick={() => setOpen(!open)}>
                            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            <span>{open ? 'Hide Records' : 'View Records'}</span>
                        </button>
                    )}
                </div>

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
                        <span className="dn-meta-value">{new Date(n.createdAt ?? n.timestamp).toLocaleString()}</span>
                    </div>
                )}

                {/* Expandable records panel */}
                {open && accepted && !revoked && (
                    <GroupRecordsPanel
                        groupId={n.groupId}
                        patientKeccak={n.receiverIdKeccak}
                        doctorKeccak={doctorKeccak}
                    />
                )}
            </div>
        </div>
    );
};

/* ── Main ── */
const DoctorNotifications = () => {
    const doctorKeccak = useSelector(selectDoctorKeccakId);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    const fetchNotifs = useCallback(async (silent = false) => {
        if (!doctorKeccak) return;
        if (!silent) { setLoading(true); setError(null); }
        try {
            const res = await fetch(`${BASE}/api/notifications/sender/${doctorKeccak}/hospital/${DEFAULT_HOSPITAL_ID}`);
            if (!res.ok) throw new Error(await res.text());
            const list = await res.json();
            list.sort((a, b) => {
                const order = (s) => isAccepted(s) ? 0 : isRevoked(s) ? 2 : 1;
                const diff = order(a.status) - order(b.status);
                if (diff !== 0) return diff;
                return new Date(b.createdAt ?? b.timestamp ?? 0) - new Date(a.createdAt ?? a.timestamp ?? 0);
            });
            setNotifications(list);
        } catch (e) { if (!silent) setError(e.message); } 
        finally { if (!silent) setLoading(false); }
    }, [doctorKeccak]);

    useEffect(() => { 
        fetchNotifs(); 
        const intervalId = setInterval(() => fetchNotifs(true), 3000);
        return () => clearInterval(intervalId);
    }, [fetchNotifs]);

    const acceptedCount = notifications.filter(n => isAccepted(n.status)).length;
    const revokedCount  = notifications.filter(n => isRevoked(n.status)).length;
    const pendingCount  = notifications.length - acceptedCount - revokedCount;

    return (
        <div className="card dn-card-root">
            <div className="card-header dn-header">
                <h2 className="heading-md">Sent Notifications</h2>
                <div className="dn-header-right">
                    <div className="dn-counts">
                        {pendingCount > 0 && <span className="dn-pill dn-pill-amber">{pendingCount} pending</span>}
                        {acceptedCount > 0 && <span className="dn-pill dn-pill-green">{acceptedCount} accepted</span>}
                        {revokedCount > 0 && <span className="dn-pill dn-pill-red">{revokedCount} revoked</span>}
                    </div>
                    <button className="dn-refresh" onClick={fetchNotifs} disabled={loading} title="Refresh">
                        <RefreshCw size={15} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="dn-list">
                {loading ? (
                    <div className="dn-status"><Loader size={20} className="spin" /> <span>Loading…</span></div>
                ) : error ? (
                    <div className="dn-status dn-error"><AlertCircle size={20} /> <span>{error}</span></div>
                ) : notifications.length > 0 ? (
                    notifications.map((n) => (
                        <NotifCard key={n.id ?? n.notificationId} n={n} doctorKeccak={doctorKeccak} />
                    ))
                ) : (
                    <div className="dn-empty">No notifications sent yet</div>
                )}
            </div>
        </div>
    );
};

export default DoctorNotifications;
