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

function createDepartment() {
    req('POST', `${BASE}/api/hospital/departments`, {
        name: document.getElementById('cd-name').value,
        description: document.getElementById('cd-description').value
    });
}

function getById() {
    const id = document.getElementById('gd-id').value;
    req('GET', `${BASE}/api/hospital/departments/${id}`);
}

function getAll() {
    req('GET', `${BASE}/api/hospital/departments`);
}
