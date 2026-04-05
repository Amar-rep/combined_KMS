import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectKeccakId } from '../features/auth/authSlice';
import { Folder, ChevronDown, ChevronUp, FileText, AlertCircle, Loader, Plus, X, Send } from 'lucide-react';
import './GroupList.css';

const BASE = 'http://localhost:8083';

const RecordItem = ({ record }) => {
    const handleDownload = async (e) => {
        e.stopPropagation();
        if (!record.fileData) {
            alert('File data is empty or not available.');
            return;
        }
        try {
            let dataUri = record.fileData;
            if (!dataUri.startsWith('data:')) {
                const mime = record.fileType || 'application/octet-stream';
                const cleanBase64 = dataUri.replace(/\s/g, '');
                dataUri = `data:${mime};base64,${cleanBase64}`;
            }

            const res = await fetch(dataUri);
            const blob = await res.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = record.fileName || 'document';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading file:', err);
            alert('Failed to download file.');
        }
    };

    return (
        <div className="record-item" onClick={handleDownload} title="Click to download">
            <FileText size={16} className="record-icon" />
            <div className="record-info">
                <span className="record-name">{record.fileName ?? record.name}</span>
                <span className="record-date">
                    {record.fileType && <>{record.fileType} · </>}
                    {record.fileSize && <>{(record.fileSize / 1024).toFixed(1)} KB · </>}
                    {(record.uploadedAt || record.date) && new Date(record.uploadedAt ?? record.date).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
};

const GroupItem = ({ group, selectable, selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const groupId = group.groupId ?? group.id;

    // Fetch records from new_records table
    const fetchRecords = useCallback(async () => {
        if (!groupId) return;
        setLoading(true);
        try {
            const res = await fetch(`${BASE}/api/new-records/group/${groupId}`);
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleToggle = () => {
        if (selectable) {
            onSelect(group);
        } else {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className={`group-item ${isOpen ? 'open' : ''} ${selected ? 'selected-group' : ''}`}>
            <div className="group-header" onClick={handleToggle}>
                <div className="group-title-section">
                    {selectable && (
                        <input type="radio" checked={selected}
                            onChange={() => onSelect(group)} onClick={(e) => e.stopPropagation()} />
                    )}
                    <Folder size={20} className="group-icon" />
                    <span className="group-name">{group.name}</span>
                    <span className="record-count">{records.length || (group.records ?? []).length} records</span>
                </div>
                {!selectable && (isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
            </div>

            {!selectable && isOpen && (
                <div className="group-records">
                    {loading ? (
                        <div className="records-loading">
                            <Loader size={14} className="spin" /> Loading records…
                        </div>
                    ) : records.length > 0 ? (
                        records.map((r) => <RecordItem key={r.id} record={r} />)
                    ) : (
                        <div className="empty-records">No records in this group</div>
                    )}
                </div>
            )}
        </div>
    );
};

const GroupList = ({ userIdKeccak: propKeccak, selectable, selectedGroupId, onSelectGroup }) => {
    const authKeccak = useSelector(selectKeccakId);
    const keccakId   = propKeccak ?? authKeccak;

    const [groups, setGroups]   = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    const [showForm, setShowForm]       = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [creating, setCreating]       = useState(false);
    const [createError, setCreateError] = useState(null);

    const isOwnGroups = !propKeccak;

    const fetchGroups = useCallback(async () => {
        if (!keccakId) return;
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${BASE}/api/hospital/groups/user/${keccakId}`);
            if (!res.ok) throw new Error(await res.text());
            setGroups(await res.json());
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, [keccakId]);

    useEffect(() => { fetchGroups(); }, [fetchGroups]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        const trimmed = newGroupName.trim();
        if (!trimmed || !keccakId) return;
        setCreating(true); setCreateError(null);
        try {
            const res = await fetch(`${BASE}/api/hospital/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmed, userIdKeccak: keccakId }),
            });
            if (!res.ok) throw new Error(await res.text());
            setNewGroupName(''); setShowForm(false);
            await fetchGroups();
        } catch (e) { setCreateError(e.message); }
        finally { setCreating(false); }
    };

    return (
        <div className="card group-list-card">
            <div className="card-header">
                <h2 className="heading-md">{propKeccak ? "Patient's Groups" : 'My Groups'}</h2>
                {isOwnGroups && (
                    <button className="btn-add-group"
                        onClick={() => { setShowForm(!showForm); setCreateError(null); }}
                        title={showForm ? 'Cancel' : 'Create new group'}>
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        <span>{showForm ? 'Cancel' : 'New Group'}</span>
                    </button>
                )}
            </div>

            {isOwnGroups && showForm && (
                <form className="create-group-form" onSubmit={handleCreateGroup}>
                    <input className="create-group-input" type="text" placeholder="Enter group name…"
                        value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                        autoFocus disabled={creating} />
                    <button type="submit" className="btn-create-submit"
                        disabled={creating || !newGroupName.trim()} title="Create group">
                        {creating ? <Loader size={16} className="spin" /> : <Send size={16} />}
                        <span>{creating ? 'Creating…' : 'Create'}</span>
                    </button>
                </form>
            )}

            {createError && (
                <div className="create-error"><AlertCircle size={14} /> <span>{createError}</span></div>
            )}

            <div className="groups-container">
                {loading ? (
                    <div className="status-container"><Loader size={20} className="spin" /> <span>Loading groups...</span></div>
                ) : error ? (
                    <div className="status-container error"><AlertCircle size={20} /> <span>{error}</span></div>
                ) : groups.length > 0 ? (
                    groups.map((group) => (
                        <GroupItem key={group.groupId ?? group.id} group={group}
                            selectable={selectable}
                            selected={selectedGroupId === (group.groupId ?? group.id)}
                            onSelect={onSelectGroup} />
                    ))
                ) : (
                    <div className="empty-groups">No groups found</div>
                )}
            </div>
        </div>
    );
};

export default GroupList;