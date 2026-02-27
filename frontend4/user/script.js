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

function registerUser() {
    req('POST', `${BASE}/api/kms/users/register`, {
        name: document.getElementById('ru-name').value,
        physicalAddress: document.getElementById('ru-address').value,
        phoneNumber: document.getElementById('ru-phone').value,
        publicKeyBase64: document.getElementById('ru-pubkey').value
    });
}

function getUserByKeccak() {
    const keccak = document.getElementById('gu-keccak').value;
    req('GET', `${BASE}/api/kms/users/${encodeURIComponent(keccak)}`);
}
