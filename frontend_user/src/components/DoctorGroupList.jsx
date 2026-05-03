import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectDoctorKeccakId } from '../features/auth/authSlice';
import { Folder, ChevronDown, ChevronUp, FileText, AlertCircle, Loader, Bell, CheckCircle, Clock, RefreshCw, UploadCloud } from 'lucide-react';
import UserWallet from './UserWallet';
import './GroupList.css';

const BASE = 'http://localhost:8083';
const DEFAULT_HOSPITAL_ID = 'QNFgbf4q4r';

const parseErrorResponse = async (res) => {
    const text = await res.text();

    try {
        const payload = JSON.parse(text);
        return payload.message || payload.developerMessage || payload.error || text || 'Request failed';
    } catch {
        return text || 'Request failed';
    }
};

const formatMetadataValue = (value) => {
    if (value == null) return '';
    if (Array.isArray(value)) {
        return value.map(formatMetadataValue).filter(Boolean).join(', ');
    }
    if (typeof value === 'object') {
        return '';
    }
    return String(value).trim();
};

const getRecordSubtitle = (record) => {
    const metadata = record.metadata;
    if (metadata && typeof metadata === 'object') {
        const preferredKeys = ['title', 'name', 'filename', 'documentType', 'type', 'description'];
        const preferredValues = preferredKeys
            .map((key) => formatMetadataValue(metadata[key]))
            .filter(Boolean);

        if (preferredValues.length > 0) {
            return preferredValues.join(' | ');
        }

        const metadataValues = Object.values(metadata)
            .map(formatMetadataValue)
            .filter(Boolean);

        if (metadataValues.length > 0) {
            return metadataValues.join(' | ');
        }
    }

    return record.cid ? 'Verified on IPFS' : '';
};

const RecordItem = ({ record, index, onDownload }) => (
    <div className="record-item" onClick={() => onDownload(record)} style={{ cursor: 'pointer' }} title="Click to download">
        <FileText size={16} className="record-icon" />
        <div className="record-info">
            <span className="record-name">{`Document-${index + 1}`}</span>
            <span className="record-date">{getRecordSubtitle(record)}</span>
        </div>
    </div>
);

const GroupItem = ({ group, onNotify, notifying, notifyError, notifySuccess, hasAccess, hasPendingNotif, onDownload, onUpload }) => {
    const [isOpen, setIsOpen] = useState(false);
    const records = group.records ?? [];

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(group, e.target.files[0]);
        }
        e.target.value = ''; // Reset for consecutive uploads
    };

    const isButtonDisabled = notifying || notifySuccess || hasAccess || hasPendingNotif;

    let buttonLabel = 'Notify';
    let ButtonIcon = Bell;

    if (hasAccess) {
        buttonLabel = 'Access Granted';
        ButtonIcon = CheckCircle;
    } else if (notifySuccess || hasPendingNotif) {
        buttonLabel = 'Pending';
        ButtonIcon = Clock;
    }

    return (
        <div className={`group-item ${isOpen ? 'open' : ''}`}>
            <div className="group-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="group-title-section">
                    <Folder size={20} className="group-icon" />
                    <span className="group-name">{group.name}</span>
                    <span className="record-count">{records.length} records</span>
                </div>
                <div className="group-header-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                        className={`btn-notify ${hasAccess ? 'granted' : ''} ${notifySuccess || hasPendingNotif ? 'success' : ''}`}
                        onClick={onNotify}
                        disabled={isButtonDisabled}
                        title="Request access to this group"
                    >
                        {notifying
                            ? <Loader size={14} className="spin" />
                            : <ButtonIcon size={14} />
                        }
                        <span>{buttonLabel}</span>
                    </button>
                    {notifyError && (
                        <span className="inline-error">
                            <AlertCircle size={12} /> {notifyError}
                        </span>
                    )}
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {isOpen && (
                <div className="group-records">
                    {hasAccess && (
                        <div style={{ marginBottom: '12px', textAlign: 'right' }}>
                            <input
                                type="file"
                                id={`file-upload-${group.groupId || group.id}`}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor={`file-upload-${group.groupId || group.id}`}
                                className="btn-upload"
                                onClick={(e) => e.stopPropagation()}
                                title="Upload a new document to this group"
                            >
                                <UploadCloud size={16} />
                                <span>Upload Document</span>
                            </label>
                        </div>
                    )}
                    {records.length > 0
                        ? records.map((record, index) => (
                            <RecordItem key={record.recordId} record={record} index={index} onDownload={() => onDownload(group, record)} />
                        ))
                        : <div className="empty-records">No records in this group</div>
                    }
                </div>
            )}
        </div>
    );
};

const DoctorGroupList = ({ patientKeccak }) => {
    const doctorKeccak = useSelector(selectDoctorKeccakId);

    const [groups, setGroups] = useState([]);
    const [accessData, setAccessData] = useState([]);
    const [notifData, setNotifData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [notifying, setNotifying] = useState({});
    const [notifyError, setNotifyError] = useState({});
    const [notifySuccess, setNotifySuccess] = useState({});

    // Wallet states
    const [walletOpen, setWalletOpen] = useState(false);
    const [walletAction, setWalletAction] = useState(null);
    const [walletGroup, setWalletGroup] = useState(null);
    const [walletRecord, setWalletRecord] = useState(null);
    const [uploadPayload, setUploadPayload] = useState(null);

    // Document Modal states
    const [viewDocument, setViewDocument] = useState(null);
    const [docLoading, setDocLoading] = useState(false);
    const [docError, setDocError] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        setGroups([]);
        setAccessData([]);
        setNotifData([]);
        setNotifying({});
        setNotifyError({});
        setNotifySuccess({});

        try {
            // Fetch groups, group accesses, and notifications concurrently
            const [groupsRes, accessRes, notifRes] = await Promise.all([
                fetch(`${BASE}/api/hospital/groups/user/${patientKeccak}`),
                fetch(`${BASE}/api/group-access/doctor/${doctorKeccak}/hospital/${DEFAULT_HOSPITAL_ID}`),
                fetch(`${BASE}/api/notifications/sender/${doctorKeccak}/hospital/${DEFAULT_HOSPITAL_ID}`)
            ]);

            if (!groupsRes.ok) throw new Error("Failed to fetch groups: " + await groupsRes.text());
            if (!accessRes.ok) throw new Error("Failed to fetch accesses: " + await accessRes.text());
            if (!notifRes.ok) throw new Error("Failed to fetch notifications: " + await notifRes.text());

            const groupsData = await groupsRes.json();

            // Now fetch records for each group
            const groupsWithRecords = await Promise.all(
                groupsData.map(async (group) => {
                    const groupId = group.groupId ?? group.id;
                    try {
                        const recordsRes = await fetch(`${BASE}/api/hospital/records/group/${groupId}`);
                        if (recordsRes.ok) {
                            group.records = await recordsRes.json();
                        } else {
                            group.records = [];
                        }
                    } catch (e) {
                        console.error(`Failed to fetch records for group ${groupId}`, e);
                        group.records = [];
                    }
                    return group;
                })
            );

            setGroups(groupsWithRecords);
            setAccessData(await accessRes.json());
            setNotifData(await notifRes.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!patientKeccak) {
            console.log('No patientKeccak provided, skipping group fetch');
            return;
        }
        fetchAll();
    }, [patientKeccak, doctorKeccak]);

    const handleNotify = async (groupId) => {
        setNotifying((prev) => ({ ...prev, [groupId]: true }));
        setNotifyError((prev) => ({ ...prev, [groupId]: null }));
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
            setNotifySuccess((prev) => ({ ...prev, [groupId]: true }));
        } catch (e) {
            setNotifyError((prev) => ({ ...prev, [groupId]: e.message }));
        } finally {
            setNotifying((prev) => ({ ...prev, [groupId]: false }));
        }
    };

    const handleDownloadIntention = (group, record) => {
        setWalletGroup(group);
        setWalletRecord(record);
        setWalletAction('download');
        setWalletOpen(true);
    };

    const handleUploadIntention = (group, file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result.split(',')[1] || e.target.result;
            let filename = file.name;
            setUploadPayload({ fileDataBase64: base64String, filename });

            setWalletGroup(group);
            setWalletAction('upload');
            setWalletOpen(true);
        };
        reader.onerror = () => alert("Error reading file.");
        reader.readAsDataURL(file);
    };

    const handleWalletSelect = async (walletResult) => {
        setWalletOpen(false);
        if (!walletResult) return;

        const { group_key_base64, signature } = walletResult;
        const groupId = walletGroup.groupId || walletGroup.id;

        try {
            if (walletAction === 'download') {
                const body = {
                    sender_keccak: doctorKeccak,
                    groupId: groupId,
                    recordId: walletRecord.recordId,
                    group_key_base64,
                    nonce: "nonce",
                    signature
                };

                setDocLoading(true);
                setDocError(null);
                setViewDocument({ name: walletRecord.metadata?.filename || 'document', blob: null, type: null });

                const res = await fetch(`${BASE}/api/documents/download`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!res.ok) {
                    const errorMessage = await parseErrorResponse(res);
                    throw new Error(errorMessage);
                }

                const blob = await res.blob();
                const name = walletRecord.metadata?.filename || 'document';
                let type = 'application/pdf';
                const lowerName = name.toLowerCase();
                if (lowerName.endsWith('.png')) type = 'image/png';
                else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) type = 'image/jpeg';
                else if (lowerName.endsWith('.pdf')) type = 'application/pdf';

                const fileBlob = new Blob([blob], { type });
                setViewDocument({ name, blob: URL.createObjectURL(fileBlob), type });
                setDocLoading(false);
            } else if (walletAction === 'upload') {
                const body = {
                    sender_keccak: doctorKeccak,
                    group_id: groupId,
                    group_key_base64,
                    nonce: "nonce",
                    signature,
                    fileDataBase64: uploadPayload.fileDataBase64,
                    filename: uploadPayload.filename,
                    metadata: {}
                };

                const res = await fetch(`${BASE}/api/documents`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!res.ok) throw new Error(await parseErrorResponse(res));

                // Refresh data to show new record
                fetchAll();
            }
        } catch (e) {
            if (walletAction === 'download') {
                setDocLoading(false);
                setDocError(
                    e.message || 'Unable to open this document. Your access may have been revoked and a fresh request may be required.'
                );
                setViewDocument({
                    name: walletRecord?.metadata?.filename || 'document',
                    blob: null,
                    type: null,
                });
                fetchAll();
            } else {
                alert(`Error processing ${walletAction}: ` + e.message);
            }
        }
    };

    return (
        <div className="card group-list-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="heading-md">Patient's Groups</h2>
                <button className="btn-notify" onClick={fetchAll} disabled={loading} title="Refresh Groups & Accesses">
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    <span style={{ marginLeft: '4px' }}>Refresh</span>
                </button>
            </div>

            <div className="groups-container">
                {loading ? (
                    <div className="status-container">
                        <Loader size={20} className="spin" />
                        <span>Fetching info...</span>
                    </div>
                ) : error ? (
                    <div className="status-container error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                ) : groups.length > 0 ? (
                    groups.map((group) => {
                        const id = group.groupId ?? group.id;

                        // Check if doctor already has ACTIVE access (response is already filtered by doctor)
                        const hasAccess = accessData.some(a =>
                            a.group?.groupId === id &&
                            a.status === 'ACTIVE'
                        );

                        // Check if doctor has an active pending notification
                        const hasPendingNotif = notifData.some(n =>
                            n.groupId === id &&
                            n.status === 'active'
                        );

                        return (
                            <GroupItem
                                key={id}
                                group={group}
                                onNotify={() => handleNotify(id)}
                                notifying={notifying[id]}
                                notifyError={notifyError[id]}
                                notifySuccess={notifySuccess[id]}
                                hasAccess={hasAccess}
                                hasPendingNotif={hasPendingNotif}
                                onDownload={handleDownloadIntention}
                                onUpload={handleUploadIntention}
                            />
                        );
                    })
                ) : (
                    <div className="empty-groups">No groups found for this patient</div>
                )}
            </div>

            <UserWallet
                isOpen={walletOpen}
                onClose={() => setWalletOpen(false)}
                onSelect={handleWalletSelect}
                defaultAction="decryptAndSign"
                defaultNonce="nonce"
                defaultGroupId={walletGroup?.groupId || walletGroup?.id}
                defaultDoctorId={doctorKeccak}
            />

            {viewDocument && !docError && (
                <div className="modal-overlay" onClick={() => setViewDocument(null)}>
                    <div className="modal-content document-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{viewDocument.name}</h3>
                            <button className="close-btn" onClick={() => setViewDocument(null)}>X</button>
                        </div>
                        <div className="modal-body">
                            {docLoading ? (
                                <div className="status-container"><Loader size={24} className="spin" /> <span>Decrypting file...</span></div>
                            ) : viewDocument.blob ? (
                                viewDocument.type.startsWith('image/') ? (
                                    <img src={viewDocument.blob} alt={viewDocument.name} style={{ maxWidth: '100%', maxHeight: '70vh' }} />
                                ) : (
                                    <iframe src={viewDocument.blob} title={viewDocument.name} style={{ width: '100%', height: '70vh', border: 'none' }} />
                                )
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {docError && (
                <div className="modal-overlay" onClick={() => { setDocError(null); setViewDocument(null); }}>
                    <div
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                        style={{ width: 'min(360px, 92vw)', borderRadius: '8px', background: '#fff', overflow: 'hidden' }}
                    >
                        <div className="modal-header">
                            <h3>Access denied</h3>
                            <button className="close-btn" onClick={() => { setDocError(null); setViewDocument(null); }}>X</button>
                        </div>
                        <div className="modal-body" style={{ minHeight: 'auto', padding: '1.25rem', justifyContent: 'flex-start' }}>
                            <div className="status-container error" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                <AlertCircle size={20} />
                                <span>Access denied</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorGroupList;
