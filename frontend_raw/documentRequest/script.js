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

function createRequest() {
    req('POST', `${BASE}/api/document-requests`, {
        senderIdKeccak: document.getElementById('cr-senderIdKeccak').value,
        receiverIdKeccak: document.getElementById('cr-receiverIdKeccak').value,
        senderHospitalId: document.getElementById('cr-senderHospitalId').value,
        receiverHospitalId: document.getElementById('cr-receiverHospitalId').value,
        groupId: document.getElementById('cr-groupId').value
    });
}

function getByReceiver() {
    const keccak = document.getElementById('gr-receiverIdKeccak').value;
    req('GET', `${BASE}/api/document-requests/receiver/${keccak}`);
}

function getByReceiverAndStatus() {
    const keccak = document.getElementById('gs-receiverIdKeccak').value;
    const status = document.getElementById('gs-status').value;
    req('GET', `${BASE}/api/document-requests/receiver/${keccak}/status/${status}`);
}
