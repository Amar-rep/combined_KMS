import { useState } from 'react';
import api from '../../api/api';
import FormCard from '../../components/FormCard';
import ResponseBox from '../../components/ResponseBox';
import ModeToggle from '../../components/ModeToggle';
import SearchMethodSelector from '../../components/SearchMethodSelector';
import { Stethoscope, UserPlus, Search, Hash, Key, Building2, List } from 'lucide-react';
import '../patient/PatientPage.css';

const modeOptions = [
    { key: 'register', label: 'Register Doctor', icon: UserPlus },
    { key: 'info', label: 'Get Info', icon: Search },
];

const searchMethods = [
    { key: 'id', label: 'By ID', icon: Hash },
    { key: 'keccak', label: 'By Keccak', icon: Key },
    { key: 'department', label: 'By Department', icon: Building2 },
    { key: 'all', label: 'All Doctors', icon: List },
];

const DoctorPage = () => {
    const [mode, setMode] = useState('register');
    const [searchMethod, setSearchMethod] = useState('id');
    const [response, setResponse] = useState(null);

    const [regForm, setRegForm] = useState({
        doctorIdKeccak: '', name: '', specialization: '', email: '', phone: '', departmentId: '', password: '',
    });
    const [searchId, setSearchId] = useState('');
    const [searchKeccak, setSearchKeccak] = useState('');
    const [searchDeptId, setSearchDeptId] = useState('');

    const showResponse = (data) => setResponse(data);
    const showError = (err) => setResponse('Error: ' + (err.response?.data || err.message));
    const clearResponse = () => setResponse(null);

    const registerDoctor = async () => {
        try {
            const payload = { ...regForm, departmentId: regForm.departmentId ? parseInt(regForm.departmentId) : null };
            const res = await api.post('/api/hospital/doctors/register', payload);
            showResponse(res.data);
        } catch (e) { showError(e); }
    };
    const getById = async () => {
        try { const res = await api.get(`/api/hospital/doctors/${searchId}`); showResponse(res.data); }
        catch (e) { showError(e); }
    };
    const getByKeccak = async () => {
        try { const res = await api.get(`/api/hospital/doctors/keccak/${searchKeccak}`); showResponse(res.data); }
        catch (e) { showError(e); }
    };
    const getByDepartment = async () => {
        try { const res = await api.get(`/api/hospital/doctors/department/${searchDeptId}`); showResponse(res.data); }
        catch (e) { showError(e); }
    };
    const getAll = async () => {
        try { const res = await api.get('/api/hospital/doctors'); showResponse(res.data); }
        catch (e) { showError(e); }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="page-header-icon"><Stethoscope size={28} /></div>
                <div>
                    <h1 className="page-title">Doctors</h1>
                    <p className="page-subtitle">Register and manage doctors</p>
                </div>
            </header>

            <ModeToggle options={modeOptions} activeMode={mode} onChange={setMode} />

            <div className="page-content">
                {mode === 'register' && (
                    <FormCard title="New Doctor" icon={UserPlus} onSubmit={registerDoctor} submitLabel="Register Doctor">
                        <input placeholder="Doctor ID (Keccak)" value={regForm.doctorIdKeccak} onChange={(e) => setRegForm({ ...regForm, doctorIdKeccak: e.target.value })} />
                        <input placeholder="Full Name" value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
                        <input placeholder="Specialization" value={regForm.specialization} onChange={(e) => setRegForm({ ...regForm, specialization: e.target.value })} />
                        <input type="email" placeholder="Email Address" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
                        <input placeholder="Phone Number" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
                        <input type="number" placeholder="Department ID" value={regForm.departmentId} onChange={(e) => setRegForm({ ...regForm, departmentId: e.target.value })} />
                        <input type="password" placeholder="Password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
                    </FormCard>
                )}

                {mode === 'info' && (
                    <div className="info-section">
                        <SearchMethodSelector methods={searchMethods} activeMethod={searchMethod} onChange={setSearchMethod} />
                        {searchMethod === 'id' && (
                            <FormCard title="Search by ID" icon={Hash} onSubmit={getById} submitLabel="Search">
                                <input placeholder="Enter Doctor ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
                            </FormCard>
                        )}
                        {searchMethod === 'keccak' && (
                            <FormCard title="Search by Keccak" icon={Key} onSubmit={getByKeccak} submitLabel="Search">
                                <input placeholder="Enter Doctor Keccak Hash" value={searchKeccak} onChange={(e) => setSearchKeccak(e.target.value)} />
                            </FormCard>
                        )}
                        {searchMethod === 'department' && (
                            <FormCard title="Search by Department" icon={Building2} onSubmit={getByDepartment} submitLabel="Search">
                                <input placeholder="Enter Department ID" value={searchDeptId} onChange={(e) => setSearchDeptId(e.target.value)} />
                            </FormCard>
                        )}
                        {searchMethod === 'all' && (
                            <FormCard title="All Doctors" icon={List} onSubmit={getAll} submitLabel="Fetch All Doctors" />
                        )}
                    </div>
                )}
            </div>

            <ResponseBox response={response} onClose={clearResponse} />
        </div>
    );
};

export default DoctorPage;
