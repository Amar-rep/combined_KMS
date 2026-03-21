import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';
import axios from 'axios';
import {
    Calendar,
    Clock,
    FileText,
    User,
    Filter,
    Loader2,
    AlertCircle,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import './DoctorAppointments.css';

const API_BASE = 'http://localhost:8083';
const STATUS_FILTERS = ['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];

const statusColor = {
    SCHEDULED: 'badge-scheduled',
    COMPLETED: 'badge-completed',
    CANCELLED: 'badge-cancelled',
};

const DoctorAppointments = () => {
    const user = useSelector(selectUser);

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('ALL');

    // Fetch doctor appointments
    const fetchAppointments = async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/api/hospital/appointments/doctor/${user.id}`);
            setAppointments(res.data);
        } catch (err) {
            setError(err.response?.data || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user?.id]);

    const handleStatus = async (appointmentId, status) => {
        setLoading(true);
        try {
            await axios.put(`${API_BASE}/api/hospital/appointments/${appointmentId}/status`, { status });
            await fetchAppointments(); // re-fetch after update
        } catch (err) {
            setError(err.response?.data || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const filtered =
        activeFilter === 'ALL'
            ? appointments
            : appointments.filter((a) => a.status === activeFilter);

    return (
        <div className="dappt-container">
            {/* ── Header ── */}
            <div className="dappt-header">
                <h2 className="heading-md">Patient Appointments</h2>
                <p className="dappt-subtitle">Review and manage incoming appointments.</p>
            </div>

            {/* ── Filter Tabs ── */}
            <div className="dappt-filters">
                <Filter size={16} className="dfilter-icon" />
                {STATUS_FILTERS.map((s) => (
                    <button
                        key={s}
                        className={`dappt-filter-btn ${activeFilter === s ? 'active' : ''}`}
                        onClick={() => setActiveFilter(s)}
                    >
                        {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="dappt-error">
                    <AlertCircle size={16} />
                    <span>{typeof error === 'string' ? error : 'Something went wrong.'}</span>
                </div>
            )}

            {/* ── Loading ── */}
            {loading && (
                <div className="dappt-loading">
                    <Loader2 size={24} className="spin" />
                    <span>Loading appointments…</span>
                </div>
            )}

            {/* ── Empty ── */}
            {!loading && filtered.length === 0 && (
                <div className="dappt-empty">
                    <Calendar size={40} />
                    <p>No appointments found.</p>
                </div>
            )}

            {/* ── List ── */}
            <div className="dappt-list">
                {filtered.map((appt, idx) => (
                    <div key={appt.id ?? idx} className="dappt-card card">
                        <div className="dappt-card-top">
                            <span className={`dappt-badge ${statusColor[appt.status] || ''}`}>
                                {appt.status}
                            </span>
                            <span className="dappt-id">#{appt.id}</span>
                        </div>

                        <div className="dappt-card-body">
                            <div className="dappt-detail">
                                <User size={14} />
                                <span>
                                    <strong>Patient:</strong>{' '}
                                    {appt.patient
                                        ? appt.patient.name || `ID ${appt.patient.id}`
                                        : `ID ${appt.patientId ?? '—'}`}
                                </span>
                            </div>
                            <div className="dappt-detail">
                                <Clock size={14} />
                                <span>
                                    {new Date(appt.appointmentDate).toLocaleString('en-IN', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </span>
                            </div>
                            {appt.notes && (
                                <div className="dappt-detail dappt-notes">
                                    <FileText size={14} />
                                    <span>{appt.notes}</span>
                                </div>
                            )}
                        </div>

                        {/* ── Action Buttons ── */}
                        {appt.status === 'SCHEDULED' && (
                            <div className="dappt-actions">
                                <button
                                    className="dappt-action-btn complete"
                                    onClick={() => handleStatus(appt.id, 'COMPLETED')}
                                    disabled={loading}
                                >
                                    <CheckCircle2 size={15} />
                                    <span>Complete</span>
                                </button>
                                <button
                                    className="dappt-action-btn cancel"
                                    onClick={() => handleStatus(appt.id, 'CANCELLED')}
                                    disabled={loading}
                                >
                                    <XCircle size={15} />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorAppointments;
