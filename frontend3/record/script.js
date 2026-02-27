const BASE = 'http://localhost:8080';

function show(data) {
    document.getElementById('response-output').textContent =
        typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
}

async function req(method, url) {
    try {
        const res = await fetch(url, { method });
        const text = await res.text();
        try { show(JSON.parse(text)); } catch { show(text); }
    } catch (e) { show('Error: ' + e.message); }
}

function getRecordsByGroup() {
    const groupId = document.getElementById('rg-groupId').value.trim();
    req('GET', `${BASE}/api/hospital/records/group/${encodeURIComponent(groupId)}`);
}
