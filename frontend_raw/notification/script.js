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

function createNotification() {
    req('POST', `${BASE}/api/notifications`, {
        senderIdKeccak: document.getElementById('cn-senderIdKeccak').value,
        receiverIdKeccak: document.getElementById('cn-receiverIdKeccak').value,
        hospitalId: document.getElementById('cn-hospitalId').value,
        groupId: document.getElementById('cn-groupId').value
    });
}

function getById() {
    const id = document.getElementById('gn-id').value;
    req('GET', `${BASE}/api/notifications/${id}`);
}

function getByReceiver() {
    const keccak = document.getElementById('gr-receiverIdKeccak').value;
    req('GET', `${BASE}/api/notifications/receiver/${keccak}`);
}

function getActiveByReceiver() {
    const keccak = document.getElementById('ga-receiverIdKeccak').value;
    req('GET', `${BASE}/api/notifications/receiver/${keccak}/active`);
}

function getByReceiverAndHospital() {
    const keccak = document.getElementById('grh-receiverIdKeccak').value;
    const hospitalId = document.getElementById('grh-hospitalId').value;
    req('GET', `${BASE}/api/notifications/receiver/${keccak}/hospital/${hospitalId}`);
}

function getByHospitalId() {
    const hospitalId = document.getElementById('gh-hospitalId').value;
    req('GET', `${BASE}/api/notifications/hospital/${hospitalId}`);
}

function getBySenderAndHospital() {
    const senderKeccak = document.getElementById('gsh-senderIdKeccak').value;
    const hospitalId = document.getElementById('gsh-hospitalId').value;
    req('GET', `${BASE}/api/notifications/sender/${senderKeccak}/hospital/${hospitalId}`);
}
