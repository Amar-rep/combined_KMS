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

function createAppointment() {
    req('POST', `${BASE}/api/hospital/appointments`, {
        patientId: parseInt(document.getElementById('ca-patientId').value),
        doctorId: parseInt(document.getElementById('ca-doctorId').value),
        date: document.getElementById('ca-date').value,
        reason: document.getElementById('ca-reason').value
    });
}

function getAppointmentById() {
    const id = document.getElementById('ga-id').value;
    req('GET', `${BASE}/api/hospital/appointments/${id}`);
}

function getByPatient() {
    const id = document.getElementById('gp-patientId').value;
    req('GET', `${BASE}/api/hospital/appointments/patient/${id}`);
}

function getByDoctor() {
    const id = document.getElementById('gd-doctorId').value;
    req('GET', `${BASE}/api/hospital/appointments/doctor/${id}`);
}

function getByStatus() {
    const status = document.getElementById('gs-status').value;
    req('GET', `${BASE}/api/hospital/appointments/status/${status}`);
}

function updateStatus() {
    const id = document.getElementById('us-id').value;
    req('PUT', `${BASE}/api/hospital/appointments/${id}/status`, {
        status: document.getElementById('us-status').value
    });
}
