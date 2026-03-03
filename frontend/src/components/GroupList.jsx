import { useSelector } from 'react-redux';
import { selectGroups } from '../features/groups/groupsSlice';
import { Folder, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useState } from 'react';
import './GroupList.css';

const RecordItem = ({ record }) => (
    <div className="record-item">
        <FileText size={16} className="record-icon" />
        <div className="record-info">
            <span className="record-name">{record.name}</span>
            <span className="record-date">{record.date}</span>
        </div>
    </div>
);

const GroupItem = ({ group }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`group-item ${isOpen ? 'open' : ''}`}>
            <div className="group-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="group-title-section">
                    <Folder size={20} className="group-icon" />
                    <span className="group-name">{group.name}</span>
                    <span className="record-count">{group.records.length} records</span>
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {isOpen && (
                <div className="group-records">
                    {group.records.map((record) => (
                        <RecordItem key={record.id} record={record} />
                    ))}
                    {group.records.length === 0 && (
                        <div className="empty-records">No records in this group</div>
                    )}
                </div>
            )}
        </div>
    );
};

const GroupList = ({ groups: propGroups }) => {
    const storeGroups = useSelector(selectGroups);
    const groups = propGroups || storeGroups;

    return (
        <div className="card group-list-card">
            <div className="card-header">
                <h2 className="heading-md">{propGroups ? "Patient's Groups" : "My Groups"}</h2>
            </div>
            <div className="groups-container">
                {groups.map((group) => (
                    <GroupItem key={group.id} group={group} />
                ))}
                {groups.length === 0 && (
                    <div className="empty-groups">No groups found</div>
                )}
            </div>
        </div>
    );
};

export default GroupList;
