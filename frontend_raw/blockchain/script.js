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

function registerUser() {
    const isActiveRaw = document.getElementById('ru-isActive').value.trim();
    const metaRaw = document.getElementById('ru-meta').value.trim();
    req('POST', `${BASE}/api/blockchain/register-user`, {
        userId: document.getElementById('ru-userId').value,
        role: document.getElementById('ru-role').value,
        isActive: isActiveRaw === 'true',
        meta: metaRaw || '{}'
    });
}

function addRecord() {
    req('POST', `${BASE}/api/blockchain/record`, {
        recordId: document.getElementById('ar-recordId').value,
        patientId: document.getElementById('ar-patientId').value,
        documentHash: document.getElementById('ar-documentHash').value,
        ipfsCid: document.getElementById('ar-ipfsCid').value
    });
}

function grantAccess() {
    req('POST', `${BASE}/api/blockchain/access/grant`, {
        recordId: document.getElementById('ga-recordId').value,
        doctorId: document.getElementById('ga-doctorId').value
    });
}

function revokeAccess() {
    req('POST', `${BASE}/api/blockchain/access/revoke`, {
        recordId: document.getElementById('ra-recordId').value,
        doctorId: document.getElementById('ra-doctorId').value
    });
}

function checkAccess() {
    const recordId = document.getElementById('ca-recordId').value;
    const viewerId = document.getElementById('ca-viewerId').value;
    req('GET', `${BASE}/api/blockchain/access/check?recordId=${encodeURIComponent(recordId)}&viewerId=${encodeURIComponent(viewerId)}`);
}

function getMerkleRoot() {
    req('GET', `${BASE}/api/blockchain/merkle-root`);
}
