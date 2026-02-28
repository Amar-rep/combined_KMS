/**
 * verify_ecies.js
 * 
 * Cross-language sanity check:
 * 1. Derives the public key from the same private key used in decrypt_group_key.js
 * 2. Encrypts a known 32-byte AES group key using eccrypto (simulating what Java does)
 * 3. Decrypts it back to confirm the round-trip works
 * 4. Prints the public key bytes so you can use them in a Java unit test
 */

const eccrypto = require("eccrypto");

const PRIVATE_KEY_HEX = `0xe7b49b089a3dbdf269b125bbe90bb5cb7d9bb270972c774ed6319471cc85df46`;

// Known 32-byte AES-256 group key (all 0x42 bytes for easy verification)
const KNOWN_GROUP_KEY = Buffer.alloc(32, 0x42);

async function main() {
    const privHex = PRIVATE_KEY_HEX.replace(/^0x/i, "");
    const privateKey = Buffer.from(privHex, "hex");

    // 1. Derive public key
    const publicKey = eccrypto.getPublic(privateKey);
    console.log("Public key (hex, 65 bytes uncompressed):");
    console.log(publicKey.toString("hex"));
    console.log("Public key (base64, for Java test):");
    console.log(publicKey.toString("base64"));
    console.log("");

    // 2. Encrypt the known group key with the public key
    const encrypted = await eccrypto.encrypt(publicKey, KNOWN_GROUP_KEY);
    const { iv, ephemPublicKey, ciphertext, mac } = encrypted;

    console.log("Encrypted components:");
    console.log("  ephemPublicKey length:", ephemPublicKey.length, "(expect 65)");
    console.log("  iv length:            ", iv.length, "(expect 16)");
    console.log("  ciphertext length:    ", ciphertext.length);
    console.log("  mac length:           ", mac.length, "(expect 32)");

    // Serialize to the same wire format as Java: [ephemPubKey(65)][iv(16)][ciphertext][mac(32)]
    const wireFormat = Buffer.concat([ephemPublicKey, iv, ciphertext, mac]);
    const wireBase64 = wireFormat.toString("base64");
    console.log("\nWire format (base64):");
    console.log(wireBase64);

    // 3. Decrypt back to verify round-trip
    const decrypted = await eccrypto.decrypt(privateKey, encrypted);
    const match = decrypted.equals(KNOWN_GROUP_KEY);
    console.log("\nRound-trip decryption:", match ? "✅ SUCCESS — keys match!" : "❌ FAILED — keys differ!");

    if (match) {
        console.log("Decrypted key (hex):", decrypted.toString("hex"));
        console.log("Expected key  (hex):", KNOWN_GROUP_KEY.toString("hex"));
    }
}

main().catch(err => {
    console.error("❌ Error:", err.message);
    process.exit(1);
});
