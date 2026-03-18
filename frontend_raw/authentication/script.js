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

function loginDoctor() {
    req('POST', `${BASE}/auth/doctor/login`, {
        email: document.getElementById('dl-email').value,
        password: document.getElementById('dl-password').value
    });
}

function loginPatient() {
    req('POST', `${BASE}/auth/patient/login`, {
        email: document.getElementById('pl-email').value,
        password: document.getElementById('pl-password').value
    });
}
