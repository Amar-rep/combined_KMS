export async function encryptKey(plaintext, password) {
    const enc = new TextEncoder()
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
    )

    const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false, ['encrypt']
    )

    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, key, enc.encode(plaintext)
    )

    return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
        iv: btoa(String.fromCharCode(...iv)),
        salt: btoa(String.fromCharCode(...salt))
    }
}

export async function decryptKey(ciphertextB64, ivB64, saltB64, password) {
    const enc = new TextEncoder()
    const dec = new TextDecoder()

    const ciphertext = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0))
    const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0))
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0))

    const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
    )

    const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false, ['decrypt']
    )

    const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv }, key, ciphertext
    )

    return dec.decode(plaintext)
}
