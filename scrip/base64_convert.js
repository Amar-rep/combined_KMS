// Your public key hex string
const publicKeyHex="0x27bdecfee21b466844d8c3893d679c633e42dcfa858dae31ece5d05d5f68fd5e8f001c2d4802a2a2cf236159bac2a82e10a1958b892e2981a445aff2c0f255ed"
const publicKeyHex2="0x8081cce2dcbba3ecf873c19e67b1afbdb06d2b220e4e4358e006f335f34f65f8fa5659bd7c7f4c2c641d6df22b0cf783f1a20af5848c48a6b021985ca968f229";
/**
 * Converts a hex string to a Base64 string
 * @param {string} hex 
 * @returns {string}
 */
function convertHexToBase64(hex) {
    // Remove the '0x' prefix if it exists
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    
    // Convert hex to a Buffer, then to a base64 string
    return Buffer.from(cleanHex, 'hex').toString('base64');
}

const base64PublicKey = convertHexToBase64(publicKeyHex);
const base2=convertHexToBase64(publicKeyHex2)

console.log("Original Hex:", publicKeyHex);
console.log("Base64 Result:", base64PublicKey);


console.log("Original Hex:", publicKeyHex2);
console.log("Base64 Result:", base2);