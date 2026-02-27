/**
 * Document Controller — script.js
 *
 * Group Key Decryption — ECIES (eccrypto-compatible, secp256k1)
 * ================================================================
 * The backend KeyService stores the encrypted group key as:
 *   Base64( JSON({ "iv": "<b64>", "ephemPublicKey": "<b64>", "ciphertext": "<b64>", "mac": "<b64>" }) )
 *
 * Decryption steps (mirrors eccrypto.decrypt):
 *   1.  base64-decode the outer value → parse JSON
 *   2.  ECDH on secp256k1: shared point = recipientPrivKey * ephemPublicKey  (full 65-byte uncompressed)
 *   3.  SHA-512(sharedPoint) → first 32 bytes = encKey, last 32 bytes = macKey
 *   4.  Verify HMAC-SHA256(macKey, iv || ephemPublicKey || ciphertext)
 *   5.  AES-256-CBC decrypt(encKey, iv, ciphertext) → group key bytes
 *   6.  Base64-encode group key bytes → done
 *
 * secp256k1 ECDH: Web Crypto API only supports NIST curves (P-256…).
 * We use the `elliptic` library (loaded via CDN in index.html) for ECDH.
 * All symmetric/hashing steps use native Web Crypto API.
 *
 * IMPORTANT: The private key must be supplied as a 64-character hex string (32 bytes).
 * (e.g., the raw secp256k1 private key, possibly the Ethereum private key)
 */

const BASE = 'http://localhost:8080';

function show(data) {
    document.getElementById('response-output').textContent =
        typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
}

async function jsonReq(method, url, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
}

// ─── Utility helpers ───────────────────────────────────────────────────────

function hexToBytes(hex) {
    const h = hex.replace(/^0x/, '');
    const arr = new Uint8Array(h.length / 2);
    for (let i = 0; i < arr.length; i++) arr[i] = parseInt(h.substr(i * 2, 2), 16);
    return arr;
}

function b64ToBytes(b64) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

function bytesToB64(bytes) {
    return btoa(String.fromCharCode(...bytes));
}

function concatBytes(...arrays) {
    const total = arrays.reduce((s, a) => s + a.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const a of arrays) { out.set(a, offset); offset += a.length; }
    return out;
}

// ─── ECIES / eccrypto decryption ───────────────────────────────────────────

/**
 * Decrypt the encrypted group key using ECIES on secp256k1 (eccrypto-compatible).
 * @param {string} encryptedB64  - outer Base64 string stored in GroupAccess
 * @param {string} privateKeyHex - 32-byte private key as a 64-char hex string
 * @returns {string} decrypted group key as base64
 */
async function decryptGroupKeyECIES(encryptedB64, privateKeyHex) {
    // 1. Decode outer base64 → parse JSON
    const json = JSON.parse(atob(encryptedB64));
    const iv = b64ToBytes(json.iv);             // 16 bytes
    const ephemPubKey = b64ToBytes(json.ephemPublicKey); // 65 bytes (0x04 prefix)
    const ciphertext = b64ToBytes(json.ciphertext);
    const mac = b64ToBytes(json.mac);

    // 2. ECDH on secp256k1 using the `elliptic` library
    //    window.elliptic is provided by the CDN script loaded in index.html
    if (typeof window.elliptic === 'undefined') {
        throw new Error('elliptic library not loaded. Check the CDN <script> tag in index.html.');
    }
    const ec = new window.elliptic.ec('secp256k1');
    const keyPair = ec.keyFromPrivate(privateKeyHex.replace(/^0x/, ''), 'hex');
    // Derive shared point: privKey * ephemPublicKey
    const ephemKeyObj = ec.keyFromPublic(ephemPubKey);
    const sharedPoint = keyPair.derive(ephemKeyObj.getPublic()); // returns BN (x coordinate only by default)

    // eccrypto uses the FULL uncompressed point (65 bytes) for hashing, NOT just the x-coordinate.
    const sharedPointFull = new Uint8Array(ec.keyFromPrivate(privateKeyHex.replace(/^0x/, ''), 'hex')
        .getPublic()          // just to get the curve – we compute the shared EC point below
        .mul(0)               // placeholder
        .encode());           // placeholder – see correct computation below

    // Correct shared point computation:
    const sharedECPoint = ephemKeyObj.getPublic().mul(keyPair.getPrivate());
    const sharedPointBytes = new Uint8Array(sharedECPoint.encode()); // 65 bytes, uncompressed

    // 3. SHA-512(sharedPoint) → encKey[0..32] + macKey[32..64]
    const sha512 = await crypto.subtle.digest('SHA-512', sharedPointBytes);
    const encKey = new Uint8Array(sha512, 0, 32);
    const macKey = new Uint8Array(sha512, 32, 32);

    // 4. Verify HMAC-SHA256(macKey, iv || ephemPublicKey || ciphertext)
    const macKeyObj = await crypto.subtle.importKey(
        'raw', macKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const macInput = concatBytes(iv, ephemPubKey, ciphertext);
    const computedMac = new Uint8Array(await crypto.subtle.sign('HMAC', macKeyObj, macInput));
    if (computedMac.length !== mac.length ||
        !computedMac.every((b, i) => b === mac[i])) {
        throw new Error('HMAC verification failed — wrong private key or corrupted data.');
    }

    // 5. AES-256-CBC decrypt
    const aesKey = await crypto.subtle.importKey(
        'raw', encKey, { name: 'AES-CBC' }, false, ['decrypt']
    );
    const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv },
        aesKey,
        ciphertext
    );

    // 6. Return as base64
    return bytesToB64(new Uint8Array(plaintext));
}

// ─── Return resolved decrypted key or error ────────────────────────────────

function getDecryptedKey() {
    return document.getElementById('decrypted-group-key').value.trim() || null;
}

// ─── Fetch & Decrypt Group Key ─────────────────────────────────────────────

async function fetchAndDecryptGroupKey() {
    const doctorId = document.getElementById('doctor-id-for-key').value.trim();
    const groupId = document.getElementById('group-id-for-key').value.trim();
    const privateKeyHex = document.getElementById('private-key-input').value.trim();

    if (!doctorId || !groupId || !privateKeyHex) {
        show('Please fill in Doctor ID, Group ID, and Private Key (hex).');
        return;
    }

    try {
        show('Fetching encrypted group key from backend...');

        // 1. Fetch encrypted group key string (base64 of JSON)
        const url = `${BASE}/api/group-access/key?groupId=${encodeURIComponent(groupId)}&doctorId=${encodeURIComponent(doctorId)}`;
        const raw = await (await fetch(url)).text();
        // Strip surrounding JSON quotes if the server returned a JSON string
        const encryptedB64 = raw.replace(/^"|"$/g, '').trim();

        // 2. Decrypt using ECIES
        const decryptedBase64 = await decryptGroupKeyECIES(encryptedB64, privateKeyHex);

        // 3. Store in field and auto-fill downstream fields
        document.getElementById('decrypted-group-key').value = decryptedBase64;
        document.getElementById('cu-groupKey').value = decryptedBase64;
        document.getElementById('dl-groupKey').value = decryptedBase64;

        show({ status: 'success', message: 'Group key decrypted successfully (ECIES/secp256k1).', decryptedBase64 });
    } catch (e) {
        show('Decryption error: ' + e.message);
    }
}

// ─── Upload / Create Document ───────────────────────────────────────────────

async function createDocument() {
    const groupKey = document.getElementById('cu-groupKey').value.trim() || getDecryptedKey();
    if (!groupKey) { show('Provide a group key or decrypt one first.'); return; }

    const fileInput = document.getElementById('cu-file');
    let fileDataBase64 = null;
    let filename = document.getElementById('cu-filename').value.trim();

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (!filename) filename = file.name;
        fileDataBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    let metadata = {};
    try { metadata = JSON.parse(document.getElementById('cu-metadata').value || '{}'); } catch { }

    try {
        const result = await jsonReq('POST', `${BASE}/api/documents`, {
            sender_keccak: document.getElementById('cu-sender').value.trim(),
            group_id: document.getElementById('cu-groupId').value.trim(),
            group_key_base64: groupKey,
            nonce: document.getElementById('cu-nonce').value.trim(),
            signature: document.getElementById('cu-signature').value.trim(),
            filename,
            metadata,
            fileDataBase64
        });
        show(result);
    } catch (e) { show('Error: ' + e.message); }
}

// ─── Download Document ─────────────────────────────────────────────────────

async function downloadDocument() {
    const groupKey = document.getElementById('dl-groupKey').value.trim() || getDecryptedKey();
    if (!groupKey) { show('Provide a group key or decrypt one first.'); return; }

    try {
        const body = {
            sender_keccak: document.getElementById('dl-sender').value.trim(),
            groupId: document.getElementById('dl-groupId').value.trim(),
            recordId: document.getElementById('dl-recordId').value.trim(),
            group_key_base64: groupKey,
            nonce: document.getElementById('dl-nonce').value.trim(),
            signature: document.getElementById('dl-signature').value.trim()
        };
        const res = await fetch(`${BASE}/api/documents/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) { show('Server error: ' + res.status); return; }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = body.recordId || 'document';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        show('File download triggered successfully.');
    } catch (e) { show('Error: ' + e.message); }
}

// ─── Give Access ────────────────────────────────────────────────────────────

async function giveAccess() {
    try {
        const result = await jsonReq('POST', `${BASE}/api/documents/access`, {
            sender_keccak: document.getElementById('ga-sender').value.trim(),
            hospital_id: document.getElementById('ga-hospitalId').value.trim(),
            receiver_keccak: document.getElementById('ga-receiver').value.trim(),
            notificationId: parseInt(document.getElementById('ga-notificationId').value),
            groupId: document.getElementById('ga-groupId').value.trim(),
            nonce: document.getElementById('ga-nonce').value.trim(),
            signature: document.getElementById('ga-signature').value.trim()
        });
        show(result);
    } catch (e) { show('Error: ' + e.message); }
}

// ─── Revoke Access ───────────────────────────────────────────────────────────

async function revokeAccess() {
    try {
        const result = await jsonReq('POST', `${BASE}/api/documents/revoke-access`, {
            sender_keccak: document.getElementById('ra-sender').value.trim(),
            groupId: document.getElementById('ra-groupId').value.trim(),
            nonce: document.getElementById('ra-nonce').value.trim(),
            signature: document.getElementById('ra-signature').value.trim()
        });
        show(result);
    } catch (e) { show('Error: ' + e.message); }
}

// ─── Allow Access Inter-Hospital ─────────────────────────────────────────────

async function allowAccessInterHospital() {
    try {
        const result = await jsonReq('POST', `${BASE}/api/documents/allow-access-inter-hospital`, {
            documentRequestId: parseInt(document.getElementById('ih-requestId').value),
            receiverIdKeccak: document.getElementById('ih-receiver').value.trim(),
            nonce: document.getElementById('ih-nonce').value.trim(),
            signature: document.getElementById('ih-signature').value.trim()
        });
        show(result);
    } catch (e) { show('Error: ' + e.message); }
}
