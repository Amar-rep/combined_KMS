export function hexToBase64(hexStr) {
    // Remove 0x prefix if present
    let hex = hexStr.replace(/^0x/, '');
    if (hex.length % 2 !== 0) {
        hex = '0' + hex;
    }

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }

    return btoa(String.fromCharCode(...bytes));
}

export function base64ToHex(base64) {
    const binary = atob(base64);
    let hex = '';
    for (let i = 0; i < binary.length; i++) {
        const hexByte = binary.charCodeAt(i).toString(16).padStart(2, '0');
        hex += hexByte;
    }
    return '0x' + hex;
}

export function ensureHexPrefix(hex) {
    return hex.startsWith('0x') ? hex : '0x' + hex;
}
