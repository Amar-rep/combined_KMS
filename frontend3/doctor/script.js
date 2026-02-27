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

function registerDoctor() {
    req('POST', `${BASE}/api/hospital/doctors/register`, {
        name: document.getElementById('rd-name').value,
        email: document.getElementById('rd-email').value,
        password: document.getElementById('rd-password').value,
        departmentId: parseInt(document.getElementById('rd-departmentId').value),
        specialty: document.getElementById('rd-specialty').value
    });
}

function getDoctorById() {
    const id = document.getElementById('gd-id').value;
    req('GET', `${BASE}/api/hospital/doctors/${id}`);
}

function getDoctorByKeccak() {
    const keccak = document.getElementById('gk-keccak').value;
    req('GET', `${BASE}/api/hospital/doctors/keccak/${encodeURIComponent(keccak)}`);
}

function getDoctorsByDepartment() {
    const id = document.getElementById('gdep-id').value;
    req('GET', `${BASE}/api/hospital/doctors/department/${id}`);
}

function getAllDoctors() {
    req('GET', `${BASE}/api/hospital/doctors`);
}
