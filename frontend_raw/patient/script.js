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

function registerPatient() {
    req('POST', `${BASE}/api/hospital/patients/register`, {
        patientIdKeccak: document.getElementById('rp-patientIdKeccak').value,
        name: document.getElementById('rp-name').value,
        email: document.getElementById('rp-email').value,
        phone: document.getElementById('rp-phone').value,
        dateOfBirth: document.getElementById('rp-dateOfBirth').value,
        address: document.getElementById('rp-address').value,
        password: document.getElementById('rp-password').value
    });
}

function getById() {
    const id = document.getElementById('gp-id').value;
    req('GET', `${BASE}/api/hospital/patients/${id}`);
}

function getByKeccak() {
    const keccak = document.getElementById('gk-keccak').value;
    req('GET', `${BASE}/api/hospital/patients/keccak/${keccak}`);
}

function getAll() {
    req('GET', `${BASE}/api/hospital/patients`);
}
