import { useState, useCallback } from 'react'

const BASE_URL = 'http://localhost:8084'

const RANDOM_HOSPITAL_KEYS = [
    'hK3mP9qL2nR7vX0sT4wY6uA8eJ1fB5cD',
    'Zx7MnQ2pW5rK0vL9aT3sU6bE4hF8gJ1y',
    'Pw4LmN8qS2vT6rX0eK3uA7bD9fG1hJ5c',
    'Vn3KmQ7pR1wL5xT9eY2sA4bU6fD8gJ0h',
    'Bq2NkP5mR8wL0xS3eT6uA9bF4cG7hJ1v',
    'CrY7MwQ1pN4vK8xT2eS5uA0bD6fG3hJ9',
    'Dt6LnP3qR9wK1xS4eU7mA2bF0cG5hJ8v',
    'Ev1MkQ4pN7wL2xT5eS8uA3bD9fG6hJ0c',
]

function generateRandomKey() {
    return RANDOM_HOSPITAL_KEYS[Math.floor(Math.random() * RANDOM_HOSPITAL_KEYS.length)]
}

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

function RegisterHospital() {
    const [form, setForm] = useState({
        name: '',
        location: '',
        hospitalKeyBase64: generateRandomKey(),
    })
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState(null)

    const handleChange = useCallback((e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }, [])

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()
        setLoading(true)
        setResponse(null)
        try {
            const res = await fetch(`${BASE_URL}/api/kms/hospitals/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            if (!res.ok) {
                setResponse({ status: 'error', body: 'Server Error' })
                return
            }

            const text = await res.text()
            let body
            try {
                const parsed = JSON.parse(text)
                body = JSON.stringify(parsed, null, 2)
            } catch {
                body = text || 'Success'
            }

            setResponse({ status: 'success', body })
        } catch (err) {
            setResponse({ status: 'error', body: 'Server Error' })
        } finally {
            setLoading(false)
        }
    }, [form])

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Register Hospital</h1>
            </div>

            <div className="card">
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Hospital Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="form-input"
                                placeholder="e.g. General Hospital"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="location">Location</label>
                            <input
                                id="location"
                                name="location"
                                type="text"
                                className="form-input"
                                placeholder="e.g. New York, USA"
                                value={form.location}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Hospital Key is auto-generated and hidden from the user */}

                    <div style={{ marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? <><span className="loading-spinner" /> Registering...</> : 'Register Hospital'}
                        </button>
                    </div>
                </form>

                <ResponseBox response={response} />
            </div>
        </div>
    )
}

export default RegisterHospital
