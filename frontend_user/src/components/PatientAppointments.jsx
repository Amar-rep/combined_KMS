import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';
import axios from 'axios';
import { CalendarPlus, Calendar, Clock, FileText, User, Filter, Loader2, AlertCircle } from 'lucide-react';
import './PatientAppointments.css';

const API_BASE = 'http://localhost:8083';
const STATUS_FILTERS = ['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];

const statusColor = {
    SCHEDULED: 'badge-scheduled',
    COMPLETED: 'badge-completed',
    CANCELLED: 'badge-cancelled',
};

const EMPTY_FORM = { doctorId: '', appointmentDate: '', notes: '' };

const PatientAppointments = () => {
    const user = useSelector(selectUser);

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');

    // Fetch patient appointments
    const fetchAppointments = async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/api/hospital/appointments/patient/${user.id}`);
            setAppointments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Fetch appointments error:', err);
            setError(err.response?.data?.message || err.response?.data || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user?.id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFormError('');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.doctorId || !form.appointmentDate) {
            setFormError('Doctor ID and date are required.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE}/api/hospital/appointments`, {
                patientId: user.id,
                doctorId: parseInt(form.doctorId),
                appointmentDate: new Date(form.appointmentDate).toISOString(),
                notes: form.notes,
            });
            setForm(EMPTY_FORM);
            setShowForm(false);
            await fetchAppointments(); // re-fetch after creating
        } catch (err) {
            setError(err.response?.data || 'Failed to create appointment');
        } finally {
            setLoading(false);
        }
    };

    const list = Array.isArray(appointments) ? appointments : [];
    const filtered = activeFilter === 'ALL'
        ? list
        : list.filter((a) => a.status === activeFilter);

    return (
        <div className="appt-container">
            {/* ── Header ── */}
            <div className="appt-header">
                <div>
                    <h2 className="heading-md">My Appointments</h2>
                    <p className="appt-subtitle">View and schedule your appointments.</p>
                </div>
                <button className="appt-create-btn" onClick={() => setShowForm(!showForm)}>
                    <CalendarPlus size={18} />
                    <span>{showForm ? 'Cancel' : 'New Appointment'}</span>
                </button>
            </div>

            {/* ── Create Form ── */}
            {showForm && (
                <form className="appt-form card" onSubmit={handleCreate}>
                    <h3 className="appt-form-title">Schedule Appointment</h3>

                    <div className="appt-form-grid">
                        <div className="appt-field">
                            <label htmlFor="pa-doctorId"><User size={14} /> Doctor ID</label>
                            <input
                                id="pa-doctorId" name="doctorId" type="number"
                                placeholder="e.g. 1" value={form.doctorId} onChange={handleChange}
                            />
                        </div>
                        <div className="appt-field">
                            <label htmlFor="pa-date"><Calendar size={14} /> Date &amp; Time</label>
                            <input
                                id="pa-date" name="appointmentDate" type="datetime-local"
                                value={form.appointmentDate} onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="appt-field">
                        <label htmlFor="pa-notes"><FileText size={14} /> Notes</label>
                        <textarea
                            id="pa-notes" name="notes" rows="3"
                            placeholder="Describe your symptoms or reason for visit…"
                            value={form.notes} onChange={handleChange}
                        />
                    </div>

                    {formError && <p className="appt-form-error">{formError}</p>}

                    <button type="submit" className="appt-submit-btn" disabled={loading}>
                        {loading ? <Loader2 size={16} className="spin" /> : <CalendarPlus size={16} />}
                        <span>Schedule</span>
                    </button>
                </form>
            )}

            {/* ── Filter Tabs ── */}
            <div className="appt-filters">
                <Filter size={16} className="filter-icon" />
                {STATUS_FILTERS.map((s) => (
                    <button
                        key={s}
                        className={`appt-filter-btn ${activeFilter === s ? 'active' : ''}`}
                        onClick={() => setActiveFilter(s)}
                    >
                        {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {error && (
                <div className="appt-error">
                    <AlertCircle size={16} />
                    <span>{typeof error === 'string' ? error : 'Something went wrong.'}</span>
                </div>
            )}

            {loading && !showForm && (
                <div className="appt-loading">
                    <Loader2 size={24} className="spin" />
                    <span>Loading appointments…</span>
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="appt-empty">
                    <Calendar size={40} />
                    <p>No appointments found.</p>
                </div>
            )}

            <div className="appt-list">
                {filtered.map((appt, idx) => (
                    <div key={appt.id ?? idx} className="appt-card card">
                        <div className="appt-card-top">
                            <span className={`appt-badge ${statusColor[appt.status] || ''}`}>{appt.status}</span>
                            <span className="appt-id">#{appt.id}</span>
                        </div>
                        <div className="appt-card-body">
                            <div className="appt-detail">
                                <User size={14} />
                                <span>
                                    <strong>Doctor:</strong>{' '}
                                    {appt.doctor ? appt.doctor.name || `ID ${appt.doctor.id}` : `ID ${appt.doctorId ?? '—'}`}
                                </span>
                            </div>
                            <div className="appt-detail">
                                <Clock size={14} />
                                <span>{new Date(appt.appointmentDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            {appt.notes && (
                                <div className="appt-detail appt-notes">
                                    <FileText size={14} />
                                    <span>{appt.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientAppointments;