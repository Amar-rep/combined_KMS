import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectKeccakId } from '../features/auth/authSlice';
import { AlertCircle, FolderLock, Loader, RefreshCw, ShieldCheck, ShieldX, UserRound } from 'lucide-react';
import UserWallet from './UserWallet';
import './PatientAccessManager.css';

const BASE = 'http://localhost:8083';
const DEFAULT_HOSPITAL_ID = 'QNFgbf4q4r';

const STATUS_LABELS = {
    ACTIVE: 'Active',
    REVOKED: 'Revoked',
};

const groupAccessesByGroup = (accesses) => {
    const grouped = new Map();

    accesses.forEach((access) => {
        const groupId = access.group?.groupId || access.groupId;
        const groupName = access.group?.name || groupId || 'Unknown Group';

        if (!grouped.has(groupId)) {
            grouped.set(groupId, {
                groupId,
                groupName,
                items: [],
            });
        }

        grouped.get(groupId).items.push(access);
    });

    return Array.from(grouped.values());
};

const formatStatus = (status) => STATUS_LABELS[status] || status || 'Unknown';

const PatientAccessManager = () => {
    const patientKeccak = useSelector(selectKeccakId);

    const [accessGroups, setAccessGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [walletOpen, setWalletOpen] = useState(false);
    const [targetGroup, setTargetGroup] = useState(null);
    const [processingGroupId, setProcessingGroupId] = useState(null);
    const [actionError, setActionError] = useState(null);

    const fetchAccesses = async () => {
        if (!patientKeccak) return;

        setLoading(true);
        setError(null);

        try {
            await fetch(`${BASE}/api/group-access/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hospitalId: DEFAULT_HOSPITAL_ID }),
            });

            const res = await fetch(`${BASE}/api/group-access/patient/${patientKeccak}/hospital/${DEFAULT_HOSPITAL_ID}`);
            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            setAccessGroups(groupAccessesByGroup(data));
        } catch (err) {
            setError(err.message || 'Failed to load group access');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccesses();
    }, [patientKeccak]);

    const handleRevokeIntent = (group) => {
        setTargetGroup(group);
        setActionError(null);
        setWalletOpen(true);
    };

    const handleWalletSelect = async (signatureHex) => {
        setWalletOpen(false);
        if (!signatureHex || !targetGroup || !patientKeccak) return;

        setProcessingGroupId(targetGroup.groupId);
        setActionError(null);

        try {
            const hexStr = signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex;
            const sigBytes = new Uint8Array(hexStr.match(/.{2}/g).map((b) => parseInt(b, 16)));
            const signatureBase64 = btoa(String.fromCharCode(...sigBytes));

            const res = await fetch(`${BASE}/api/documents/revoke-access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_keccak: patientKeccak,
                    groupId: targetGroup.groupId,
                    nonce: 'nonce',
                    signature: signatureBase64,
                }),
            });

            if (!res.ok) throw new Error(await res.text());

            await fetchAccesses();
        } catch (err) {
            setActionError(err.message || 'Failed to revoke group access');
        } finally {
            setProcessingGroupId(null);
        }
    };

    return (
        <div className="card access-manager-card">
            <div className="card-header">
                <div>
                    <h2 className="heading-md">Group Access</h2>
                    <p className="access-subtitle">Review which doctors can open each group and revoke the group when needed.</p>
                </div>
                <button className="btn-notify" onClick={fetchAccesses} disabled={loading} title="Refresh group access">
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    <span style={{ marginLeft: '4px' }}>Refresh</span>
                </button>
            </div>

            <div className="access-groups">
                {loading ? (
                    <div className="status-container">
                        <Loader size={20} className="spin" />
                        <span>Loading group access...</span>
                    </div>
                ) : error ? (
                    <div className="status-container error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                ) : accessGroups.length > 0 ? (
                    accessGroups.map((group) => {
                        const hasActiveAccess = group.items.some((item) => item.status === 'ACTIVE');
                        const activeDoctors = group.items.filter((item) => item.status === 'ACTIVE').length;

                        return (
                            <section key={group.groupId} className="access-group-card">
                                <div className="access-group-header">
                                    <div className="access-group-title">
                                        <FolderLock size={18} />
                                        <div>
                                            <h3>{group.groupName}</h3>
                                            <p>{activeDoctors} active doctor{activeDoctors === 1 ? '' : 's'} with access</p>
                                        </div>
                                    </div>

                                    <button
                                        className="btn-revoke-access"
                                        onClick={() => handleRevokeIntent(group)}
                                        disabled={!hasActiveAccess || processingGroupId === group.groupId}
                                        title={hasActiveAccess ? 'Revoke access for this group' : 'No active access to revoke'}
                                    >
                                        {processingGroupId === group.groupId ? (
                                            <><Loader size={14} className="spin" /> Revoking...</>
                                        ) : (
                                            <><ShieldX size={14} /> Revoke Access</>
                                        )}
                                    </button>
                                </div>

                                <div className="access-doctor-list">
                                    {group.items.map((item) => (
                                        <div key={item.id} className="access-doctor-row">
                                            <div className="doctor-meta">
                                                <div className="doctor-avatar">
                                                    <UserRound size={16} />
                                                </div>
                                                <div>
                                                    <div className="doctor-name">{item.doctor?.name || item.doctor?.doctorIdKeccak || 'Unknown doctor'}</div>
                                                    <div className="doctor-subtext">{item.doctor?.doctorIdKeccak || 'No doctor identifier available'}</div>
                                                </div>
                                            </div>

                                            <span className={`access-status-pill ${item.status === 'ACTIVE' ? 'active' : 'revoked'}`}>
                                                {item.status === 'ACTIVE' ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                                                {formatStatus(item.status)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {actionError && targetGroup?.groupId === group.groupId && (
                                    <div className="access-action-error">
                                        <AlertCircle size={14} />
                                        <span>{actionError}</span>
                                    </div>
                                )}
                            </section>
                        );
                    })
                ) : (
                    <div className="empty-groups">No doctors have been linked to your groups yet</div>
                )}
            </div>

            <UserWallet
                isOpen={walletOpen}
                onClose={() => setWalletOpen(false)}
                onSelect={handleWalletSelect}
                defaultAction="signTransaction"
                defaultNonce="nonce"
            />
        </div>
    );
};

export default PatientAccessManager;
