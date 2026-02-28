import { ethers } from "ethers";

// private key of the user (0x...)
const privateKey = "0x5e8bdc28a7a6ab5ab0d7988e2ea35347ee8df83446fef16409b20b3c4b913062"

// nonce string (must match exactly what backend verifies)
const nonce = "nonce";

async function signNonce() {
  const wallet = new ethers.Wallet(privateKey);

  // This automatically applies Ethereum message prefix
  const signatureHex = await wallet.signMessage(nonce);

  // Convert hex signature → bytes → Base64
  const signatureBytes = ethers.getBytes(signatureHex);
  const signatureBase64 = Buffer.from(signatureBytes).toString("base64");

  console.log("Signature Base64:", signatureBase64);
}

signNonce();
