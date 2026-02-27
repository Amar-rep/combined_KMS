const BASE = 'http://localhost:8080';

function show(data) {
    document.getElementById('response-output').textContent =
        typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
}

async function req(method, url, body) {
    try {
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        const text = await res.text();
        try { show(JSON.parse(text)); } catch { show(text); }
    } catch (e) { show('Error: ' + e.message); }
}

function registerUser() {
    req('POST', `${BASE}/api/blockchain/register-user`, {
        userId: document.getElementById('ru-userId').value.trim(),
        role: document.getElementById('ru-role').value.trim(),
        isActive: document.getElementById('ru-isActive').value === 'true',
        meta: document.getElementById('ru-meta').value.trim() || '{}'
    });
}

function addRecord() {
    req('POST', `${BASE}/api/blockchain/record`, {
        recordId: document.getElementById('ar-recordId').value.trim(),
        patientId: document.getElementById('ar-patientId').value.trim(),
        documentHash: document.getElementById('ar-docHash').value.trim(),
        ipfsCid: document.getElementById('ar-ipfsCid').value.trim()
    });
}

function grantAccess() {
    req('POST', `${BASE}/api/blockchain/access/grant`, {
        recordId: document.getElementById('grant-recordId').value.trim(),
        doctorId: document.getElementById('grant-doctorId').value.trim()
    });
}

function revokeAccess() {
    req('POST', `${BASE}/api/blockchain/access/revoke`, {
        recordId: document.getElementById('revoke-recordId').value.trim(),
        doctorId: document.getElementById('revoke-doctorId').value.trim()
    });
}

function checkAccess() {
    const recordId = document.getElementById('check-recordId').value.trim();
    const viewerId = document.getElementById('check-viewerId').value.trim();
    req('GET', `${BASE}/api/blockchain/access/check?recordId=${encodeURIComponent(recordId)}&viewerId=${encodeURIComponent(viewerId)}`);
}

function getMerkleRoot() {
    req('GET', `${BASE}/api/blockchain/merkle-root`);
}
