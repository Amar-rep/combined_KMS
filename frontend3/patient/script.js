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

function registerPatient() {
    req('POST', `${BASE}/api/hospital/patients/register`, {
        name: document.getElementById('rp-name').value,
        email: document.getElementById('rp-email').value,
        password: document.getElementById('rp-password').value,
        dateOfBirth: document.getElementById('rp-dob').value
    });
}

function getPatientById() {
    const id = document.getElementById('gp-id').value;
    req('GET', `${BASE}/api/hospital/patients/${id}`);
}

function getPatientByKeccak() {
    const keccak = document.getElementById('gk-keccak').value;
    req('GET', `${BASE}/api/hospital/patients/keccak/${encodeURIComponent(keccak)}`);
}

function getAllPatients() {
    req('GET', `${BASE}/api/hospital/patients`);
}
