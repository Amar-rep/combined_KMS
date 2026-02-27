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

function createGroup() {
    req('POST', `${BASE}/api/hospital/groups`, {
        groupId: document.getElementById('cg-groupId').value.trim(),
        name: document.getElementById('cg-name').value.trim()
    });
}

function getGroupById() {
    const id = document.getElementById('gg-id').value;
    req('GET', `${BASE}/api/hospital/groups/${id}`);
}

function getGroupByGroupId() {
    const groupId = document.getElementById('ggi-groupId').value.trim();
    req('GET', `${BASE}/api/hospital/groups/group-id/${encodeURIComponent(groupId)}`);
}

function getGroupsByUser() {
    const keccak = document.getElementById('gu-keccak').value.trim();
    req('GET', `${BASE}/api/hospital/groups/user/${encodeURIComponent(keccak)}`);
}

function getAllGroups() {
    req('GET', `${BASE}/api/hospital/groups`);
}
