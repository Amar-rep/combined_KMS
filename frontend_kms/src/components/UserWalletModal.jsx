import { useState, useEffect } from 'react'
import { saveUserToWallet, getUsersFromWallet, deleteUserFromWallet } from '../utils/db'
import { encryptKey, decryptKey } from '../utils/crypto'
import { hexToBase64, ensureHexPrefix } from '../utils/hex'
import { Wallet } from 'ethers'

export default function UserWalletModal({ isOpen, onClose, onSelect }) {
    const [view, setView] = useState('select') // 'select' or 'add'
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Add Form state
    const [addForm, setAddForm] = useState({ name: '', publicKeyHex: '', privateKeyHex: '', password: '' })

    // Action Panel state for selected user
    const [selectedUser, setSelectedUser] = useState(null)
    const [actionForm, setActionForm] = useState({
        actionType: 'exportBase64Pub', // 'exportBase64Pub', 'exportHexPub', 'signTransaction'
        password: '',
        nonce: ''
    })

    useEffect(() => {
        if (isOpen) {
            loadUsers()
            setView('select')
            setError(null)
            setSelectedUser(null)
            setAddForm({ name: '', publicKeyHex: '', privateKeyHex: '', password: '' })
            setActionForm({ actionType: 'exportBase64Pub', password: '', nonce: '' })
        }
    }, [isOpen])

    const loadUsers = async () => {
        try {
            const data = await getUsersFromWallet()
            setUsers(data)
        } catch {
            setError('Failed to load wallet users')
        }
    }

    const handleAddSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const privHex = ensureHexPrefix(addForm.privateKeyHex)
            const pubHex = ensureHexPrefix(addForm.publicKeyHex)

            const { ciphertext, iv, salt } = await encryptKey(privHex, addForm.password)
            await saveUserToWallet({
                name: addForm.name,
                publicKey: pubHex, // Stores standard Hex prefix
                encryptedPrivateKey: ciphertext,
                iv,
                salt,
            })
            await loadUsers()
            setView('select')
        } catch (err) {
            console.error(err)
            setError('Failed to save user securely')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id, e) => {
        e.stopPropagation()
        if (confirm('Are you sure you want to remove this user from your wallet?')) {
            try {
                await deleteUserFromWallet(id)
                if (selectedUser && selectedUser.id === id) {
                    setSelectedUser(null)
                }
                await loadUsers()
            } catch {
                setError('Failed to delete user')
            }
        }
    }

    const handleActionSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Common logic: For any action, we likely need to decrypt the private key to prove ownership
            // or to actually use it (Signing). Wait, for just exporting the public key, do we *really* need to decrypt?
            // Yes, user asked "enter password to push it into that field" to confirm. Let's decrypt to verify password.
            const descryptedPrivKey = await decryptKey(
                selectedUser.encryptedPrivateKey,
                selectedUser.iv,
                selectedUser.salt,
                actionForm.password
            )

            if (!descryptedPrivKey) throw new Error('Decryption returned empty.')

            let resultString = ''

            if (actionForm.actionType === 'exportBase64Pub') {
                resultString = hexToBase64(selectedUser.publicKey)
            } else if (actionForm.actionType === 'exportHexPub') {
                resultString = selectedUser.publicKey
            } else if (actionForm.actionType === 'signTransaction') {
                // Sign the nonce/message using ethers.js
                const wallet = new Wallet(descryptedPrivKey)
                resultString = await wallet.signMessage(actionForm.nonce)
            }

            onSelect(resultString)
        } catch (err) {
            console.error(err)
            setError('Invalid password or action failed.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Secure Wallet</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-tabs">
                    <button
                        className={`modal-tab ${view === 'select' ? 'active' : ''}`}
                        onClick={() => { setView('select'); setSelectedUser(null); setError(null); }}
                    >
                        Select User
                    </button>
                    <button
                        className={`modal-tab ${view === 'add' ? 'active' : ''}`}
                        onClick={() => { setView('add'); setError(null); }}
                    >
                        Add New User
                    </button>
                </div>

                <div className="modal-body">
                    {error && <div className="modal-error">{error}</div>}

                    {view === 'select' ? (
                        !selectedUser ? (
                            <div className="wallet-list">
                                {users.length === 0 ? (
                                    <div className="wallet-empty">
                                        No users stored in wallet securely.
                                        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={() => setView('add')}>
                                            Add your first user
                                        </button>
                                    </div>
                                ) : (
                                    users.map(u => (
                                        <div key={u.id} className="wallet-item" onClick={() => setSelectedUser(u)}>
                                            <div className="wallet-item-info">
                                                <div className="wallet-item-name">{u.name}</div>
                                                <div className="wallet-item-key" title={u.publicKey}>
                                                    {u.publicKey.substring(0, 16)}...
                                                </div>
                                            </div>
                                            <button className="wallet-item-delete" onClick={(e) => handleDelete(u.id, e)}>
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="action-panel">
                                <button
                                    className="btn btn-sm btn-secondary"
                                    style={{ marginBottom: '16px' }}
                                    onClick={() => setSelectedUser(null)}>
                                    &larr; Back to Users
                                </button>
                                <div style={{ marginBottom: '16px' }}>
                                    <strong style={{ display: 'block', fontSize: '1.2rem' }}>{selectedUser.name}</strong>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedUser.publicKey.substring(0, 24)}...</span>
                                </div>

                                <form className="form" onSubmit={handleActionSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Action</label>
                                        <select
                                            className="form-input"
                                            value={actionForm.actionType}
                                            onChange={e => setActionForm({ ...actionForm, actionType: e.target.value })}
                                        >
                                            <option value="exportBase64Pub">Export Base64 Public Key</option>
                                            <option value="exportHexPub">Export Hex Public Key</option>
                                            <option value="signTransaction">Sign Transaction</option>
                                        </select>
                                    </div>

                                    {actionForm.actionType === 'signTransaction' && (
                                        <div className="form-group" style={{ animation: 'modal-up 0.2s ease' }}>
                                            <label className="form-label">Nonce / Message to Sign</label>
                                            <input
                                                type="text" className="form-input" required
                                                value={actionForm.nonce}
                                                onChange={e => setActionForm({ ...actionForm, nonce: e.target.value })}
                                                placeholder="Enter nonce or data"
                                            />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label">Wallet Password</label>
                                        <input
                                            type="password" className="form-input" required
                                            value={actionForm.password}
                                            onChange={e => setActionForm({ ...actionForm, password: e.target.value })}
                                            placeholder="Enter password to authorize"
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '12px' }}>
                                        {loading ? 'Processing...' : 'Confirm'}
                                    </button>
                                </form>
                            </div>
                        )
                    ) : (
                        <form className="form" onSubmit={handleAddSubmit}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text" className="form-input" required
                                    value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                                    placeholder="e.g. Alice"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Public Key (Hex)</label>
                                <input
                                    type="text" className="form-input" required
                                    value={addForm.publicKeyHex} onChange={e => setAddForm({ ...addForm, publicKeyHex: e.target.value })}
                                    placeholder="0x..."
                                    style={{ fontFamily: "'Courier New', monospace", fontSize: '0.82rem' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Private Key (Hex)</label>
                                <input
                                    type="text" className="form-input" required
                                    value={addForm.privateKeyHex} onChange={e => setAddForm({ ...addForm, privateKeyHex: e.target.value })}
                                    placeholder="0x..."
                                    style={{ fontFamily: "'Courier New', monospace", fontSize: '0.82rem' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Wallet Password</label>
                                <input
                                    type="password" className="form-input" required
                                    value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                                    placeholder="Used to encrypt private key"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '12px' }}>
                                {loading ? 'Encrypting & Saving...' : 'Save to Wallet securely'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
