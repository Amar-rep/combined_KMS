const BASE = 'http://localhost:8084';

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

function registerHospital() {
    req('POST', `${BASE}/api/kms/hospitals/register`, {
        name: document.getElementById('rh-name').value,
        location: document.getElementById('rh-location').value,
        hospitalKeyBase64: document.getElementById('rh-key').value
    });
}

function getHospitalById() {
    const id = document.getElementById('gh-id').value;
    req('GET', `${BASE}/api/kms/hospitals/${id}`);
}
