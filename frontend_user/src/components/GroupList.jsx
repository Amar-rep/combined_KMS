import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectKeccakId } from '../features/auth/authSlice';
import { Folder, ChevronDown, ChevronUp, FileText, AlertCircle, Loader } from 'lucide-react';
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

    const [groups, setGroups]   = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    useEffect(() => {
        if (!keccakId) return;
        const fetchGroups = async () => {
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