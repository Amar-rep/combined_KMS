import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectKeccakId } from '../features/auth/authSlice';
import { Folder, ChevronDown, ChevronUp, FileText, AlertCircle, Loader, Plus, X, Send } from 'lucide-react';
import './GroupList.css';

const BASE = 'http://localhost:8083';

const RecordItem = ({ record }) => (
    <div className="record-item">
        <FileText size={16} className="record-icon" />
        <div className="record-info">
            <span className="record-name">{record.name}</span>
            <span className="record-date">{record.date}</span>
        </div>
    </div>
);

const GroupItem = ({ group, selectable, selected, onSelect }) => {
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
                        ? records.map((r) => <RecordItem key={r.id} record={r} />)
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
    const keccakId   = propKeccak ?? authKeccak;

    const [groups, setGroups]     = useState([]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState(null);

    // Create-group form state
    const [showForm, setShowForm]       = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [creating, setCreating]       = useState(false);
    const [createError, setCreateError] = useState(null);

    const isOwnGroups = !propKeccak; // patient viewing their own groups

    const fetchGroups = useCallback(async () => {
        if (!keccakId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE}/api/hospital/groups/user/${keccakId}`);
            if (!res.ok) throw new Error(await res.text());
            setGroups(await res.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [keccakId]);

    useEffect(() => { fetchGroups(); }, [fetchGroups]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        const trimmed = newGroupName.trim();
        if (!trimmed || !keccakId) return;

        setCreating(true);
        setCreateError(null);
        try {
            const res = await fetch(`${BASE}/api/hospital/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmed, userIdKeccak: keccakId }),
            });
            if (!res.ok) throw new Error(await res.text());
            // Successfully created — reset form & refresh list
            setNewGroupName('');
            setShowForm(false);
            await fetchGroups();
        } catch (e) {
            setCreateError(e.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="card group-list-card">
            <div className="card-header">
                <h2 className="heading-md">{propKeccak ? "Patient's Groups" : 'My Groups'}</h2>
                {isOwnGroups && (
                    <button
                        className="btn-add-group"
                        onClick={() => { setShowForm(!showForm); setCreateError(null); }}
                        title={showForm ? 'Cancel' : 'Create new group'}
                    >
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        <span>{showForm ? 'Cancel' : 'New Group'}</span>
                    </button>
                )}
            </div>

            {/* ── Inline Create-Group Form ── */}
            {isOwnGroups && showForm && (
                <form className="create-group-form" onSubmit={handleCreateGroup}>
                    <input
                        className="create-group-input"
                        type="text"
                        placeholder="Enter group name…"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        autoFocus
                        disabled={creating}
                    />
                    <button
                        type="submit"
                        className="btn-create-submit"
                        disabled={creating || !newGroupName.trim()}
                        title="Create group"
                    >
                        {creating ? <Loader size={16} className="spin" /> : <Send size={16} />}
                        <span>{creating ? 'Creating…' : 'Create'}</span>
                    </button>
                </form>
            )}

            {createError && (
                <div className="create-error">
                    <AlertCircle size={14} /> <span>{createError}</span>
                </div>
            )}

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
                        />
                    ))
                ) : (
                    <div className="empty-groups">No groups found</div>
                )}
            </div>
        </div>
    );
};

export default GroupList;