import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectDoctorKeccakId } from '../features/auth/authSlice';
import {
    Folder, ChevronDown, ChevronUp, FileText, AlertCircle,
    Loader, Bell, Plus, Upload, ShieldX, CheckCircle2, Lock, X
} from 'lucide-react';
import './GroupList.css';
import './DoctorGroupRecords.css';

const BASE = 'http://localhost:8083';
const DEFAULT_HOSPITAL_ID = 'bJwqraIk3w';

const isAccepted = (s) => (s ?? '').toUpperCase().startsWith('ACCEPT');
const isRevoked  = (s) => (s ?? '').toUpperCase().startsWith('REVOKE');

/* ── Records Panel (inside an accepted group) ── */
const RecordsPanel = ({ groupId, patientKeccak, doctorKeccak }) => {
    const [records, setRecords]     = useState([]);
    const [loading, setLoading]     = useState(false);
    const [file, setFile]           = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError]         = useState(null);
    const [viewingRecord, setViewingRecord] = useState(null);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE}/api/new-records/group/${groupId}`);
            if (res.ok) setRecords(await res.json());
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [groupId]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true); setError(null);
        try {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1] || reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const res = await fetch(`${BASE}/api/new-records`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId, patientKeccak, doctorKeccak,
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

    const fmtSize = (b) => {
        if (!b) return '';
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
        return (b / 1048576).toFixed(1) + ' MB';
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
        <div className="drp-panel">
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

            {/* Upload bar */}
            <div className="drp-upload">
                <label className="drp-file-label">
                    <Plus size={14} />
                    <span>{file ? file.name : 'Add record…'}</span>
                    <input type="file" className="drp-file-input"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
                <button className="drp-upload-btn" onClick={handleUpload} disabled={!file || uploading}>
                    {uploading ? <Loader size={14} className="spin" /> : <Upload size={14} />}
                    <span>{uploading ? 'Uploading…' : 'Upload'}</span>
                </button>
            </div>

            {error && <div className="drp-error"><AlertCircle size={13} /> {error}</div>}

            {loading ? (
                <div className="drp-loading"><Loader size={14} className="spin" /> Loading records…</div>
            ) : records.length > 0 ? (
                <div className="drp-list">
                    {records.map((r) => (
                        <div key={r.id} className="drp-record" onClick={(e) => handleView(e, r)} title="Click to view">
                            <FileText size={15} className="drp-rec-icon" />
                            <div className="drp-rec-info">
                                <span className="drp-rec-name">{r.fileName}</span>
                                <span className="drp-rec-meta">
                                    {r.fileType} · {fmtSize(r.fileSize)}
                                    {r.uploadedAt && <> · {new Date(r.uploadedAt).toLocaleDateString()}</>}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="drp-empty">No records yet — upload a file to get started.</div>
            )}
        </div>
    );
};

/* ── Group Item ── */
const GroupItem = ({ group, doctorKeccak, patientKeccak, notifStatus, onNotify, notifying, notifyError, notifySuccess }) => {
    const [isOpen, setIsOpen] = useState(false);

    const accepted = isAccepted(notifStatus);
    const revoked  = isRevoked(notifStatus);
    const pending  = !accepted && !revoked && notifStatus;

    const groupId = group.groupId ?? group.id;

    // Status badge
    let statusBadge = null;
    if (accepted) statusBadge = <span className="dgl-badge dgl-badge-green"><CheckCircle2 size={11} /> Accepted</span>;
    else if (revoked) statusBadge = <span className="dgl-badge dgl-badge-red"><ShieldX size={11} /> Revoked</span>;
    else if (pending) statusBadge = <span className="dgl-badge dgl-badge-amber"><Bell size={11} /> Pending</span>;

    return (
        <div className={`group-item ${isOpen ? 'open' : ''} ${revoked ? 'dgl-revoked' : ''}`}>
            <div className="group-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="group-title-section">
                    <Folder size={20} className="group-icon" />
                    <span className="group-name">{group.name}</span>
                    {statusBadge}
                </div>

                <div className="group-header-actions" onClick={(e) => e.stopPropagation()}>
                    {/* Show Notify button only when no notification sent yet */}
                    {!notifStatus && (
                        <button
                            className={`btn-notify ${notifySuccess ? 'success' : ''}`}
                            onClick={onNotify}
                            disabled={notifying || notifySuccess}
                            title="Request access to this group"
                        >
                            {notifying ? <Loader size={14} className="spin" /> : <Bell size={14} />}
                            <span>{notifySuccess ? 'Sent' : 'Notify'}</span>
                        </button>
                    )}
                    {notifyError && (
                        <span className="inline-error"><AlertCircle size={12} /> {notifyError}</span>
                    )}
                </div>

                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {isOpen && (
                <div className="group-records">
                    {revoked ? (
                        <div className="dgl-revoked-msg">
                            <Lock size={16} />
                            <span>Access has been revoked by the patient. You can no longer view or add records.</span>
                        </div>
                    ) : accepted ? (
                        <RecordsPanel groupId={groupId} patientKeccak={patientKeccak} doctorKeccak={doctorKeccak} />
                    ) : (
                        <div className="empty-records">
                            {notifStatus ? 'Waiting for patient to accept your access request…' : 'Send a notification to request access to this group.'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ── Main Component ── */
const DoctorGroupList = ({ patientKeccak }) => {
    const doctorKeccak = useSelector(selectDoctorKeccakId);

    const [groups, setGroups]   = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    // Notification statuses per groupId
    const [notifStatuses, setNotifStatuses] = useState({});

    const [notifying, setNotifying]         = useState({});
    const [notifyError, setNotifyError]     = useState({});
    const [notifySuccess, setNotifySuccess] = useState({});

    // Fetch groups + notifications
    useEffect(() => {
        if (!patientKeccak || !doctorKeccak) return;

        const fetchGroups = async () => {
            try {
                setLoading(true);
                const gRes = await fetch(`${BASE}/api/hospital/groups/user/${patientKeccak}`);
                if (!gRes.ok) throw new Error(await gRes.text());
                setGroups(await gRes.json());
            } catch (e) { setError(e.message); }
            finally { setLoading(false); }
        };

        const fetchNotifs = async () => {
            try {
                const nRes = await fetch(`${BASE}/api/notifications/sender/${doctorKeccak}/hospital/${DEFAULT_HOSPITAL_ID}`);
                if (nRes.ok) {
                    const notifs = await nRes.json();
                    const statusMap = {};
                    for (const n of notifs) {
                        if (n.receiverIdKeccak === patientKeccak && n.groupId) {
                            const existing = statusMap[n.groupId];
                            if (!existing || isAccepted(n.status)) {
                                statusMap[n.groupId] = n.status;
                            }
                        }
                    }
                    setNotifStatuses(statusMap);
                }
            } catch { /* silent fail on background poll */ }
        };

        fetchGroups().then(fetchNotifs);
        const intervalId = setInterval(fetchNotifs, 3000);
        return () => clearInterval(intervalId);
    }, [patientKeccak, doctorKeccak]);

    const handleNotify = async (groupId) => {
        setNotifying((p) => ({ ...p, [groupId]: true }));
        setNotifyError((p) => ({ ...p, [groupId]: null }));
        try {
            const res = await fetch(`${BASE}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderIdKeccak: doctorKeccak,
                    receiverIdKeccak: patientKeccak,
                    hospitalId: DEFAULT_HOSPITAL_ID,
                    groupId,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            setNotifySuccess((p) => ({ ...p, [groupId]: true }));
            // Update status immediately to 'active' (pending)
            setNotifStatuses((p) => ({ ...p, [groupId]: 'active' }));
        } catch (e) {
            setNotifyError((p) => ({ ...p, [groupId]: e.message }));
        } finally {
            setNotifying((p) => ({ ...p, [groupId]: false }));
        }
    };

    return (
        <div className="card group-list-card">
            <div className="card-header">
                <h2 className="heading-md">Patient's Groups</h2>
            </div>

            <div className="groups-container">
                {loading ? (
                    <div className="status-container">
                        <Loader size={20} className="spin" /> <span>Fetching groups...</span>
                    </div>
                ) : error ? (
                    <div className="status-container error">
                        <AlertCircle size={20} /> <span>{error}</span>
                    </div>
                ) : groups.length > 0 ? (
                    groups.map((group) => {
                        const id = group.groupId ?? group.id;
                        return (
                            <GroupItem
                                key={id}
                                group={group}
                                doctorKeccak={doctorKeccak}
                                patientKeccak={patientKeccak}
                                notifStatus={notifStatuses[id]}
                                onNotify={() => handleNotify(id)}
                                notifying={notifying[id]}
                                notifyError={notifyError[id]}
                                notifySuccess={notifySuccess[id]}
                            />
                        );
                    })
                ) : (
                    <div className="empty-groups">No groups found for this patient</div>
                )}
            </div>
        </div>
    );
};

export default DoctorGroupList;