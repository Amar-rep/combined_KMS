import { useState } from 'react';
import api from '../../api/api';
import FormCard from '../../components/FormCard';
import ResponseBox from '../../components/ResponseBox';
import ModeToggle from '../../components/ModeToggle';
import SearchMethodSelector from '../../components/SearchMethodSelector';
import { Users, UserPlus, Search, Hash, Key, List } from 'lucide-react';
import './PatientPage.css';

const modeOptions = [
    { key: 'register', label: 'Register Patient', icon: UserPlus },
    { key: 'info', label: 'Get Info', icon: Search },
];

const searchMethods = [
    { key: 'id', label: 'By ID', icon: Hash },
    { key: 'keccak', label: 'By Keccak', icon: Key },
    { key: 'all', label: 'All Patients', icon: List },
];

const PatientPage = () => {
    const [mode, setMode] = useState('register');
    const [searchMethod, setSearchMethod] = useState('id');
    const [response, setResponse] = useState(null);

    const [regForm, setRegForm] = useState({
        patientIdKeccak: '', name: '', email: '', phone: '', dateOfBirth: '', address: '', password: '',
    });
    const [searchId, setSearchId] = useState('');
    const [searchKeccak, setSearchKeccak] = useState('');

    const showResponse = (data) => setResponse(data);
    const showError = (err) => setResponse('Error: ' + (err.response?.data || err.message));
    const clearResponse = () => setResponse(null);

    const registerPatient = async () => {
        try { const res = await api.post('/api/hospital/patients/register', regForm); showResponse(res.data); }
        catch (e) { showError(e); }
    };
    const getById = async () => {
        try { const res = await api.get(`/api/hospital/patients/${searchId}`); showResponse(res.data); }
        catch (e) { showError(e); }
    };
    const getByKeccak = async () => {
        try { const res = await api.get(`/api/hospital/patients/keccak/${searchKeccak}`); showResponse(res.data); }
        catch (e) { showError(e); }
    };
    const getAll = async () => {
        try { const res = await api.get('/api/hospital/patients'); showResponse(res.data); }
        catch (e) { showError(e); }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="page-header-icon"><Users size={28} /></div>
                <div>
                    <h1 className="page-title">Patients</h1>
                    <p className="page-subtitle">Register and manage patients</p>
                </div>
            </header>

            <ModeToggle options={modeOptions} activeMode={mode} onChange={setMode} />

            <div className="page-content">
                {mode === 'register' && (
                    <FormCard title="New Patient" icon={UserPlus} onSubmit={registerPatient} submitLabel="Register Patient">
                        <input placeholder="Patient ID (Keccak)" value={regForm.patientIdKeccak} onChange={(e) => setRegForm({ ...regForm, patientIdKeccak: e.target.value })} />
                        <input placeholder="Full Name" value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
                        <input type="email" placeholder="Email Address" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
                        <input placeholder="Phone Number" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
                        <input type="date" placeholder="Date of Birth" value={regForm.dateOfBirth} onChange={(e) => setRegForm({ ...regForm, dateOfBirth: e.target.value })} />
                        <input placeholder="Address" value={regForm.address} onChange={(e) => setRegForm({ ...regForm, address: e.target.value })} />
                        <input type="password" placeholder="Password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
                    </FormCard>
                )}

                {mode === 'info' && (
                    <div className="info-section">
                        <SearchMethodSelector methods={searchMethods} activeMethod={searchMethod} onChange={setSearchMethod} />
                        {searchMethod === 'id' && (
                            <FormCard title="Search by ID" icon={Hash} onSubmit={getById} submitLabel="Search">
                                <input placeholder="Enter Patient ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
                            </FormCard>
                        )}
                        {searchMethod === 'keccak' && (
                            <FormCard title="Search by Keccak" icon={Key} onSubmit={getByKeccak} submitLabel="Search">
                                <input placeholder="Enter Patient Keccak Hash" value={searchKeccak} onChange={(e) => setSearchKeccak(e.target.value)} />
                            </FormCard>
                        )}
                        {searchMethod === 'all' && (
                            <FormCard title="All Patients" icon={List} onSubmit={getAll} submitLabel="Fetch All Patients" />
                        )}
                    </div>
                )}
            </div>

            <ResponseBox response={response} onClose={clearResponse} />
        </div>
    );
};

export default PatientPage;
