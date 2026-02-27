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

function createDocumentRequest() {
    req('POST', `${BASE}/api/document-requests`, {
        senderIdKeccak: document.getElementById('cr-sender').value.trim(),
        receiverIdKeccak: document.getElementById('cr-receiver').value.trim(),
        senderHospitalId: document.getElementById('cr-senderHospital').value.trim(),
        receiverHospitalId: document.getElementById('cr-receiverHospital').value.trim(),
        groupId: document.getElementById('cr-groupId').value.trim()
    });
}

function getByReceiver() {
    const receiver = document.getElementById('gr-receiver').value.trim();
    req('GET', `${BASE}/api/document-requests/receiver/${encodeURIComponent(receiver)}`);
}

function getByReceiverAndStatus() {
    const receiver = document.getElementById('grs-receiver').value.trim();
    const status = document.getElementById('grs-status').value.trim();
    req('GET', `${BASE}/api/document-requests/receiver/${encodeURIComponent(receiver)}/status/${encodeURIComponent(status)}`);
}
