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

function createDocument() {
    const metaRaw = document.getElementById('cd-metadata').value.trim();
    let metadata = {};
    if (metaRaw) { try { metadata = JSON.parse(metaRaw); } catch { show('metadata is not valid JSON'); return; } }

    const fileInput = document.getElementById('cd-fileInput');
    if (!fileInput.files || fileInput.files.length === 0) {
        show('Please select a file to upload.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        // e.target.result is a data URL like "data:application/pdf;base64,JVBER..."
        // We only want the base64 part for the backend
        const base64String = e.target.result.split(',')[1] || e.target.result;

        let filenameInput = document.getElementById('cd-filename').value.trim();
        if (!filenameInput) {
            filenameInput = file.name;
        }

        req('POST', `${BASE}/api/documents`, {
            sender_keccak: document.getElementById('cd-sender_keccak').value,
            group_id: document.getElementById('cd-group_id').value,
            group_key_base64: document.getElementById('cd-group_key_base64').value,
            nonce: document.getElementById('cd-nonce').value,
            signature: document.getElementById('cd-signature').value,
            fileDataBase64: base64String,
            filename: filenameInput,
            metadata
        });
    };

    reader.onerror = function (e) {
        show('Error reading file.');
    };

    reader.readAsDataURL(file);
}

async function downloadDocument() {
    try {
        const body = {
            sender_keccak: document.getElementById('dl-sender_keccak').value,
            groupId: document.getElementById('dl-groupId').value,
            recordId: document.getElementById('dl-recordId').value,
            group_key_base64: document.getElementById('dl-group_key_base64').value,
            nonce: document.getElementById('dl-nonce').value,
            signature: document.getElementById('dl-signature').value
        };
        const res = await fetch(`${BASE}/api/documents/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) { show('Error: ' + res.status + ' ' + await res.text()); return; }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document';
        a.click();
        URL.revokeObjectURL(url);
        show('Download triggered.');
    } catch (e) { show('Error: ' + e.message); }
}

function giveAccess() {
    req('POST', `${BASE}/api/documents/access`, {
        sender_keccak: document.getElementById('ga-sender_keccak').value,
        hospital_id: document.getElementById('ga-hospital_id').value,
        receiver_keccak: document.getElementById('ga-receiver_keccak').value,
        notificationId: parseInt(document.getElementById('ga-notificationId').value),
        groupId: document.getElementById('ga-groupId').value,
        nonce: document.getElementById('ga-nonce').value,
        signature: document.getElementById('ga-signature').value
    });
}

function revokeAccess() {
    req('POST', `${BASE}/api/documents/revoke-access`, {
        sender_keccak: document.getElementById('ra-sender_keccak').value,
        groupId: document.getElementById('ra-groupId').value,
        nonce: document.getElementById('ra-nonce').value,
        signature: document.getElementById('ra-signature').value
    });
}

function allowAccessInterHospital() {
    req('POST', `${BASE}/api/documents/allow-access-inter-hospital`, {
        documentRequestId: parseInt(document.getElementById('ih-documentRequestId').value),
        receiverIdKeccak: document.getElementById('ih-receiverIdKeccak').value,
        nonce: document.getElementById('ih-nonce').value,
        signature: document.getElementById('ih-signature').value
    });
}
