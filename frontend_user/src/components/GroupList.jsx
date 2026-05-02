import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectKeccakId } from '../features/auth/authSlice';
import { Folder, ChevronDown, ChevronUp, FileText, AlertCircle, Loader } from 'lucide-react';
import './GroupList.css';

const BASE = 'http://localhost:8083';

const RecordItem = ({ record, onClick }) => {
    const name = record.metadata?.title || record.metadata?.name || record.name || record.recordId || 'Unnamed Record';
    const dateStr = record.createdAt ? new Date(record.createdAt).toLocaleDateString() : (record.date || '');

    return (
        <div className="record-item" onClick={() => onClick(record, name)}>
            <FileText size={16} className="record-icon" />
            <div className="record-info">
                <span className="record-name">{name}</span>
                <span className="record-date">{dateStr}</span>
            </div>
        </div>
    );
};

const GroupItem = ({ group, selectable, selected, onSelect, onRecordClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const records = group.records ?? [];

    return (
        <div className={`group-item ${isOpen ? 'open' : ''} ${selected ? 'selected-group' : ''}`}>
            <div
                className="group-header"
                onClick={() => selectable ? onSelect(group) : setIsOpen(!isOpen)}
            >
                <div className="group-title-section">
                    {selectable && (
                        <input
                            type="radio"
                            checked={selected}
                            onChange={() => onSelect(group)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                    <Folder size={20} className="group-icon" />
                    <span className="group-name">{group.name}</span>
                    <span className="record-count">{records.length} records</span>
                </div>
                {!selectable && (isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
            </div>

            {!selectable && isOpen && (
                <div className="group-records">
                    {records.length > 0
                        ? records.map((r) => <RecordItem key={r.recordId || r.id} record={r} onClick={(rec, name) => onRecordClick(rec, name, group)} />)
                        : <div className="empty-records">No records in this group</div>
                    }
                </div>
            )}
        </div>
    );
};

// userIdKeccak prop → doctor passing patient's keccak
// no prop          → falls back to logged-in user's keccak from Redux
const GroupList = ({ userIdKeccak: propKeccak, selectable, selectedGroupId, onSelectGroup }) => {
    const authKeccak = useSelector(selectKeccakId);
    const keccakId = propKeccak ?? authKeccak;

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [viewDocument, setViewDocument] = useState(null);
    const [docLoading, setDocLoading] = useState(false);
    const [docError, setDocError] = useState(null);

    const handleRecordClick = async (record, name, group) => {
        setDocLoading(true);
        setDocError(null);
        setViewDocument({ name, blob: null, type: null });
        try {
            const res = await fetch(`http://localhost:8084/health/fetch-ipfs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: group.groupId ?? group.id,
                    recordId: record.recordId
                })
            });
            if (!res.ok) throw new Error("Failed to fetch document");

            const blob = await res.blob();
            let type = 'application/pdf';
            const lowerName = name.toLowerCase();
            if (lowerName.endsWith('.png')) type = 'image/png';
            else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) type = 'image/jpeg';
            else if (lowerName.endsWith('.pdf')) type = 'application/pdf';

            const fileBlob = new Blob([blob], { type });
            setViewDocument({ name, blob: URL.createObjectURL(fileBlob), type });
        } catch (e) {
            setDocError(e.message);
        } finally {
            setDocLoading(false);
        }
    };

    useEffect(() => {
        if (!keccakId) return;
        const fetchGroups = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${BASE}/api/hospital/groups/user/${keccakId}`);
                if (!res.ok) throw new Error(await res.text());
                const groupsData = await res.json();

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
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, [keccakId]);

    return (
        <div className="card group-list-card">
            <div className="card-header">
                <h2 className="heading-md">{propKeccak ? "Patient's Groups" : 'My Groups'}</h2>
            </div>
            <div className="groups-container">
                {loading ? (
                    <div className="status-container">
                        <Loader size={20} className="spin" /> <span>Loading groups...</span>
                    </div>
                ) : error ? (
                    <div className="status-container error">
                        <AlertCircle size={20} /> <span>{error}</span>
                    </div>
                ) : groups.length > 0 ? (
                    groups.map((group) => (
                        <GroupItem
                            key={group.groupId ?? group.id}
                            group={group}
                            selectable={selectable}
                            selected={selectedGroupId === (group.groupId ?? group.id)}
                            onSelect={onSelectGroup}
                            onRecordClick={handleRecordClick}
                        />
                    ))
                ) : (
                    <div className="empty-groups">No groups found</div>
                )}
            </div>

            {viewDocument && (
                <div className="modal-overlay" onClick={() => setViewDocument(null)}>
                    <div className="modal-content document-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{viewDocument.name}</h3>
                            <button className="close-btn" onClick={() => setViewDocument(null)}>X</button>
                        </div>
                        <div className="modal-body">
                            {docLoading ? (
                                <div className="status-container"><Loader size={24} className="spin" /> <span>Fetching file...</span></div>
                            ) : docError ? (
                                <div className="status-container error"><AlertCircle size={24} /> <span>{docError}</span></div>
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
        </div>
    );
};

export default GroupList;