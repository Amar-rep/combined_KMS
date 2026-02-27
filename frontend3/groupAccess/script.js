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

function syncFromKms() {
    req('POST', `${BASE}/api/group-access/sync`, {
        hospitalId: document.getElementById('sync-hospitalId').value.trim()
    });
}

function getByHospitalId() {
    const id = document.getElementById('gh-hospitalId').value.trim();
    req('GET', `${BASE}/api/group-access/hospital/${encodeURIComponent(id)}`);
}

function getEncryptedGroupKey() {
    const groupId = document.getElementById('gk-groupId').value.trim();
    const doctorId = document.getElementById('gk-doctorId').value.trim();
    req('GET', `${BASE}/api/group-access/key?groupId=${encodeURIComponent(groupId)}&doctorId=${encodeURIComponent(doctorId)}`);
}
