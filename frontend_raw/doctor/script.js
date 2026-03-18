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

function registerDoctor() {
    req('POST', `${BASE}/api/hospital/doctors/register`, {
        doctorIdKeccak: document.getElementById('rd-doctorIdKeccak').value,
        name: document.getElementById('rd-name').value,
        specialization: document.getElementById('rd-specialization').value,
        email: document.getElementById('rd-email').value,
        phone: document.getElementById('rd-phone').value,
        departmentId: parseInt(document.getElementById('rd-departmentId').value),
        password: document.getElementById('rd-password').value
    });
}

function getById() {
    const id = document.getElementById('gd-id').value;
    req('GET', `${BASE}/api/hospital/doctors/${id}`);
}

function getByKeccak() {
    const keccak = document.getElementById('gk-keccak').value;
    req('GET', `${BASE}/api/hospital/doctors/keccak/${keccak}`);
}

function getByDepartment() {
    const id = document.getElementById('gdep-id').value;
    req('GET', `${BASE}/api/hospital/doctors/department/${id}`);
}

function getAll() {
    req('GET', `${BASE}/api/hospital/doctors`);
}
