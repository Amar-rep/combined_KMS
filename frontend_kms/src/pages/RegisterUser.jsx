import { useState, useCallback } from 'react'
import UserWalletModal from '../components/UserWalletModal'

const BASE_URL = 'http://localhost:8084'

function ResponseBox({ response }) {
    if (!response) return null
    const isError = response.status === 'error'
    const isSuccess = response.status === 'success'
    return (
        <div className={`response-box ${isError ? 'response-error' : isSuccess ? 'response-success' : ''}`}>
            <div className="response-header">
                <span className="response-title">{isError ? 'Registration Failed' : 'Registration Successful'}</span>
                <span className={`response-status ${isError ? 'error' : isSuccess ? 'success' : 'pending'}`}>
                    {isError ? 'Error' : isSuccess ? 'Success' : 'Pending'}
                </span>
            </div>
            <div className="response-body">
                {isError ? (
                    <div className="error-message" style={{ color: '#d32f2f', fontWeight: '500', padding: '10px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>
                        {response.body}
                    </div>
                ) : (
                    <pre className="response-pre">{response.body}</pre>
                )}
            </div>
        </div>
    )
}

function RegisterUser() {
    const [form, setForm] = useState({
        name: '',
        physicalAddress: '',
        phoneNumber: '',
        publicKeyBase64: '',
    })
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState(null)
    const [isWalletOpen, setIsWalletOpen] = useState(false)

    const handleChange = useCallback((e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }, [])

    const handleWalletSelect = (pubKey) => {
        setForm(prev => ({ ...prev, publicKeyBase64: pubKey }))
        setIsWalletOpen(false)
    }

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()
        setLoading(true)
        setResponse(null)
        try {
            const res = await fetch(`${BASE_URL}/api/kms/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const text = await res.text()
            let body
            try {
                const parsed = JSON.parse(text);
                if (!res.ok) {
                    body = parsed.message || parsed.error || JSON.stringify(parsed, null, 2);
                } else {
                    body = JSON.stringify(parsed, null, 2);
                }
            } catch {
                body = text || (res.ok ? 'Success' : `HTTP Error ${res.status}: ${res.statusText}`);
            }
            setResponse({ status: res.ok ? 'success' : 'error', body })
        } catch (err) {
            setResponse({ status: 'error', body: 'Network error. Please check your connection .' })
        } finally {
            setLoading(false)
        }
    }, [form])

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Register User</h1>
            </div>

            <div className="card">
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="form-input"
                                placeholder="e.g. John Doe"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="phoneNumber">Phone Number</label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                className="form-input"
                                placeholder="e.g. +1 234-567-8901"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="physicalAddress">Physical Address</label>
                        <input
                            id="physicalAddress"
                            name="physicalAddress"
                            type="text"
                            className="form-input"
                            placeholder="e.g. 123 Main Street, New York, NY 10001"
                            value={form.physicalAddress}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
                            <label className="form-label" htmlFor="publicKeyBase64" style={{ marginBottom: 0 }}>Public Key</label>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setIsWalletOpen(true)}
                            >
                                Select from Wallet
                            </button>
                        </div>
                        <input
                            id="publicKeyBase64"
                            name="publicKeyBase64"
                            type="text"
                            className="form-input"
                            placeholder="Base64-encoded public key"
                            value={form.publicKeyBase64}
                            onChange={handleChange}
                            required
                            style={{ fontFamily: "'Courier New', monospace", fontSize: '0.82rem' }}
                        />
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? <><span className="loading-spinner" /> Registering...</> : 'Register User'}
                        </button>
                    </div>
                </form>

                <ResponseBox response={response} />
            </div>

            <UserWalletModal
                isOpen={isWalletOpen}
                onClose={() => setIsWalletOpen(false)}
                onSelect={handleWalletSelect}
            />
        </div>
    )
}

export default RegisterUser
