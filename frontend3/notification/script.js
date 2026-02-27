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

function createNotification() {
    req('POST', `${BASE}/api/notifications`, {
        senderIdKeccak: document.getElementById('cn-sender').value.trim(),
        receiverIdKeccak: document.getElementById('cn-receiver').value.trim(),
        hospitalId: document.getElementById('cn-hospitalId').value.trim(),
        groupId: document.getElementById('cn-groupId').value.trim()
    });
}

function getNotificationById() {
    const id = document.getElementById('gn-id').value;
    req('GET', `${BASE}/api/notifications/${id}`);
}

function getByReceiver() {
    const r = document.getElementById('gr-receiver').value.trim();
    req('GET', `${BASE}/api/notifications/receiver/${encodeURIComponent(r)}`);
}

function getActiveNotifications() {
    const r = document.getElementById('ga-receiver').value.trim();
    req('GET', `${BASE}/api/notifications/receiver/${encodeURIComponent(r)}/active`);
}

function getByReceiverAndHospital() {
    const r = document.getElementById('grh-receiver').value.trim();
    const h = document.getElementById('grh-hospitalId').value.trim();
    req('GET', `${BASE}/api/notifications/receiver/${encodeURIComponent(r)}/hospital/${encodeURIComponent(h)}`);
}

function getByHospitalId() {
    const h = document.getElementById('gh-hospitalId').value.trim();
    req('GET', `${BASE}/api/notifications/hospital/${encodeURIComponent(h)}`);
}

function getBySenderAndHospital() {
    const s = document.getElementById('gsh-sender').value.trim();
    const h = document.getElementById('gsh-hospitalId').value.trim();
    req('GET', `${BASE}/api/notifications/sender/${encodeURIComponent(s)}/hospital/${encodeURIComponent(h)}`);
}
