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

function createGroup() {
    req('POST', `${BASE}/api/hospital/groups`, {
        name: document.getElementById('cg-name').value,
        userIdKeccak: document.getElementById('cg-userIdKeccak').value
    });
}

function getById() {
    const id = document.getElementById('gi-id').value;
    req('GET', `${BASE}/api/hospital/groups/${id}`);
}

function getByGroupId() {
    const groupId = document.getElementById('gg-groupId').value;
    req('GET', `${BASE}/api/hospital/groups/group-id/${groupId}`);
}

function getByUser() {
    const keccak = document.getElementById('gu-userIdKeccak').value;
    req('GET', `${BASE}/api/hospital/groups/user/${keccak}`);
}

function getAll() {
    req('GET', `${BASE}/api/hospital/groups`);
}
