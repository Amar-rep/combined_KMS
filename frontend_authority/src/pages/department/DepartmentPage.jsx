import { useState } from 'react';
import api from '../../api/api';
import FormCard from '../../components/FormCard';
import ResponseBox from '../../components/ResponseBox';
import ModeToggle from '../../components/ModeToggle';
import SearchMethodSelector from '../../components/SearchMethodSelector';
import { Building2, PlusCircle, Search, Hash, List } from 'lucide-react';
import '../patient/PatientPage.css';

const modeOptions = [
    { key: 'create', label: 'Create Department', icon: PlusCircle },
    { key: 'info', label: 'Get Info', icon: Search },
];

const searchMethods = [
    { key: 'id', label: 'By ID', icon: Hash },
    { key: 'all', label: 'All Departments', icon: List },
];

const DepartmentPage = () => {
    const [mode, setMode] = useState('create');
    const [searchMethod, setSearchMethod] = useState('id');
    const [response, setResponse] = useState(null);

    const [createForm, setCreateForm] = useState({ name: '', description: '' });
    const [searchId, setSearchId] = useState('');

    const showResponse = (data) => setResponse(data);
    const showError = (err) => setResponse('Error: ' + (err.response?.data || err.message));
    const clearResponse = () => setResponse(null);

    const createDepartment = async () => {
        try { const res = await api.post('/api/hospital/departments', createForm); showResponse(res.data); }
        catch (e) { showError(e); }
    };
    const getById = async () => {
        try { const res = await api.get(`/api/hospital/departments/${searchId}`); showResponse(res.data); }
        catch (e) { showError(e); }
    };
    const getAll = async () => {
        try { const res = await api.get('/api/hospital/departments'); showResponse(res.data); }
        catch (e) { showError(e); }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="page-header-icon"><Building2 size={28} /></div>
                <div>
                    <h1 className="page-title">Departments</h1>
                    <p className="page-subtitle">Create and manage departments</p>
                </div>
            </header>

            <ModeToggle options={modeOptions} activeMode={mode} onChange={setMode} />

            <div className="page-content">
                {mode === 'create' && (
                    <FormCard title="New Department" icon={PlusCircle} onSubmit={createDepartment} submitLabel="Create Department">
                        <input placeholder="Department Name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
                        <input placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
                    </FormCard>
                )}

                {mode === 'info' && (
                    <div className="info-section">
                        <SearchMethodSelector methods={searchMethods} activeMethod={searchMethod} onChange={setSearchMethod} />
                        {searchMethod === 'id' && (
                            <FormCard title="Search by ID" icon={Hash} onSubmit={getById} submitLabel="Search">
                                <input placeholder="Enter Department ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
                            </FormCard>
                        )}
                        {searchMethod === 'all' && (
                            <FormCard title="All Departments" icon={List} onSubmit={getAll} submitLabel="Fetch All Departments" />
                        )}
                    </div>
                )}
            </div>

            <ResponseBox response={response} onClose={clearResponse} />
        </div>
    );
};

export default DepartmentPage;
