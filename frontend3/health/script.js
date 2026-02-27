const BASE = 'http://localhost:8080';

function show(data) {
    document.getElementById('response-output').textContent =
        typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
}

async function healthCheck() {
    try {
        const res = await fetch(`${BASE}/health`);
        show(await res.text());
    } catch (e) { show('Error: ' + e.message); }
}
