import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectKeccakId , selectDoctorKeccakId} from '../features/auth/authSlice';
import { Folder, ChevronDown, ChevronUp, FileText, AlertCircle, Loader, Bell } from 'lucide-react';
import './GroupList.css';

const BASE = 'http://localhost:8083';
const DEFAULT_HOSPITAL_ID = 'bJwqraIk3w';

const RecordItem = ({ record }) => (
    <div className="record-item">
        <FileText size={16} className="record-icon" />
        <div className="record-info">
            <span className="record-name">{record.name}</span>
            <span className="record-date">{record.date}</span>
        </div>
    </div>
);

const GroupItem = ({ group, onNotify, notifying, notifyError, notifySuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    const records = group.records ?? [];

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
                        className={`btn-notify ${notifySuccess ? 'success' : ''}`}
                        onClick={onNotify}
                        disabled={notifying || notifySuccess}
                        title="Request access to this group"
                    >
                        {notifying
                            ? <Loader size={14} className="spin" />
                            : <Bell size={14} />
                        }
                        <span>{notifySuccess ? 'Sent' : 'Notify'}</span>
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
                    {records.length > 0
                        ? records.map((record) => (
                            <RecordItem key={record.id} record={record} />
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

    const [groups, setGroups]               = useState([]);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState(null);

    const [notifying, setNotifying]         = useState({});
    const [notifyError, setNotifyError]     = useState({});
    const [notifySuccess, setNotifySuccess] = useState({});

    useEffect(() => {
        if (!patientKeccak) {
            console.log('No patientKeccak provided, skipping group fetch');
            return;
        }
        const fetchGroups = async () => {
            setLoading(true);
            setError(null);
            setGroups([]);
            setNotifying({});
            setNotifyError({});
            setNotifySuccess({});
            try {
                const res = await fetch(`${BASE}/api/hospital/groups/user/${patientKeccak}`);
                console.log(res);
                if (!res.ok) throw new Error(await res.text());
                setGroups(await res.json());
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, [patientKeccak]);

    const handleNotify = async (groupId) => {
        setNotifying((prev) => ({ ...prev, [groupId]: true }));
        setNotifyError((prev) => ({ ...prev, [groupId]: null }));
        try {
            const res = await fetch(`${BASE}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderIdKeccak:   doctorKeccak,
                    receiverIdKeccak: patientKeccak,
                    hospitalId:       DEFAULT_HOSPITAL_ID,
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

    return (
        <div className="card group-list-card">
            <div className="card-header">
                <h2 className="heading-md">Patient's Groups</h2>
            </div>

            <div className="groups-container">
                {loading ? (
                    <div className="status-container">
                        <Loader size={20} className="spin" />
                        <span>Fetching groups...</span>
                    </div>
                ) : error ? (
                    <div className="status-container error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                ) : groups.length > 0 ? (
                    groups.map((group) => {
                        const id = group.groupId ?? group.id;
                        return (
                            <GroupItem
                                key={id}
                                group={group}
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