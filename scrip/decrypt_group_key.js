const eccrypto = require("eccrypto");

const ENCRYPTED_GROUP_KEY_BASE64 = 'BJY1dQd7jcNjA+ru6UxgHXeLLzBjtkcCTLqTRIH5KLqYthXAM7t4CqBrTUcz1eMYnBFzrtFW5rQAy1HH52h6VL9BPoHAJUJEld8UnpFsAn20okjXdam0BOEWeIsj9S+wEnxfu1UdeocsDkfclIZYEhrQeIuKCO2KVWoPQu2FLhNG+68RN9qarj1/vimDpQ9+LQ==';

const PRIVATE_KEY_HEX = `0x5e8bdc28a7a6ab5ab0d7988e2ea35347ee8df83446fef16409b20b3c4b913062`;

async function main() {
    try {
        const privHex = PRIVATE_KEY_HEX.replace(/^0x/i, "");
        if (privHex.length !== 64) {
            throw new Error(`Private key must be 64 hex chars (32 bytes). Got ${privHex.length}.`);
        }

        const privateKey = Buffer.from(privHex, "hex");
        const encBytes = Buffer.from(ENCRYPTED_GROUP_KEY_BASE64, "base64");

        if (encBytes.length < 129) {
            throw new Error("Payload too short.");
        }

        const ephemPublicKey = encBytes.slice(0, 65);
        const iv = encBytes.slice(65, 81);
        const mac = encBytes.slice(encBytes.length - 32);
        const ciphertext = encBytes.slice(81, encBytes.length - 32);

        const decrypted = await eccrypto.decrypt(privateKey, {
            iv,
            ephemPublicKey,
            ciphertext,
            mac,
        });

        console.log("✅ Decryption successful!\n");
        console.log("Group Key (Base64):");
        console.log(decrypted.toString("base64"));
        console.log("\nGroup Key (hex):");
        console.log(decrypted.toString("hex"));
        console.log(`\nKey size: ${decrypted.length * 8} bits`);

    } catch (err) {
        console.error("❌ Decryption failed:", err.message);
        process.exit(1);
    }
}

main();
