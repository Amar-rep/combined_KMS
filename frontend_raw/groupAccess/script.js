const BASE = 'http://localhost:8083';

function show(data) {
    document.getElementById('response-output').textContent =
        typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
}

async function req(method, url, body) {
    try {
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (body !== undefined) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        const text = await res.text();
        try { show(JSON.parse(text)); } catch { show(text); }
    } catch (e) { show('Error: ' + e.message); }
}

function syncFromKms() {
    req('POST', `${BASE}/api/group-access/sync`, {
        hospitalId: document.getElementById('sy-hospitalId').value
    });
}

function getByHospitalId() {
    const hospitalId = document.getElementById('gh-hospitalId').value;
    req('GET', `${BASE}/api/group-access/hospital/${hospitalId}`);
}

async function getEncryptedGroupKey() {
    const groupId = document.getElementById('gk-groupId').value;
    const doctorId = document.getElementById('gk-doctorId').value;
    const privateKeyHex = document.getElementById('gk-privateKey').value.trim();

    const url = `${BASE}/api/group-access/key?groupId=${encodeURIComponent(groupId)}&doctorId=${encodeURIComponent(doctorId)}`;

    try {
        const res = await fetch(url);
        const text = await res.text();

        // Show raw backend response
        try { show(JSON.parse(text)); } catch { show(text); }

        if (res.ok && privateKeyHex && text) {
            try {
                // Ensure the private key is a Buffer/Uint8Array
                const cleanHex = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
                const privateKeyBuffer = window.eccryptoJS ?
                    window.eccryptoJS.hexToBuffer(cleanHex) :
                    new Uint8Array(cleanHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

                // The text is expected to be a JSON string from backend 
                let encObj = JSON.parse(text);

                // A helper to decode base64 or hex into Uint8Array
                const parseField = (field) => {
                    if (field.type === 'Buffer' && Array.isArray(field.data)) return new Uint8Array(field.data);
                    if (typeof field === 'string') {
                        // Check if it's hex
                        if (/^[0-9a-fA-F]+$/.test(field)) {
                            return new Uint8Array(field.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                        }
                        // Otherwise treat it as base64
                        const binary = atob(field);
                        return new Uint8Array([...binary].map(char => char.charCodeAt(0)));
                    }
                    return field;
                };

                const encryptedObject = {
                    iv: parseField(encObj.iv),
                    ephemPublicKey: parseField(encObj.ephemPublicKey),
                    ciphertext: parseField(encObj.ciphertext),
                    mac: parseField(encObj.mac)
                };

                let decryptedBytes;
                if (window.eccryptoJS) {
                    decryptedBytes = await window.eccryptoJS.decrypt(privateKeyBuffer, encryptedObject);
                } else if (window.eccrypto) {
                    decryptedBytes = await window.eccrypto.decrypt(privateKeyBuffer, encryptedObject);
                } else {
                    throw new Error("eccrypto library is not loaded.");
                }

                // Display the decrypted AES key in base64 format
                const decryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(decryptedBytes)));
                document.getElementById('decrypted-key-output').textContent = decryptedBase64;
            } catch (err) {
                document.getElementById('decrypted-key-output').textContent = 'Decryption failed: ' + err.message;
            }
        } else {
            document.getElementById('decrypted-key-output').textContent = 'Provide private key to decrypt, or request failed.';
        }
    } catch (e) {
        show('Error: ' + e.message);
    }
}
