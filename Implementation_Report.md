# implementation

## System Architecture and Secure Communication
The system implements a dual-module architecture consisting of a Hospital Backend and a Key Management System (KMS). Communication between these modules allows for rigorous separation of concerns, where the Hospital module handles administrative workflows and patient interactions, while the KMS manages cryptographic operations, identity verification, and decentralized storage. Secure communication is enforced via RESTful APIs, authenticated using cryptographic signatures to ensure non-repudiation and integrity.

## Cryptographic Configuration and Key Management
The core security framework leverages elliptic curve cryptography and symmetric encryption standards to ensure data confidentiality and authenticity.

**Cryptographic Primitives:**
*   **Elliptic Curve:** `secp256k1` is utilized for asymmetric operations, aligning with Ethereum standards for compatibility and robust security.
*   **Signature Scheme:** **ECDSA** (Elliptic Curve Digital Signature Algorithm) is employed for authenticating all API requests. Every critical action (upload, download, access grant) requires a valid signature verification against the user's stored public key.
*   **Symmetric Encryption:** **AES** (Advanced Encryption Standard) is used in two modes:
    *   **AES-128 GCM (Galois/Counter Mode):** Used for high-performance encryption of file data, ensuring both confidentiality and integrity via its built-in authentication tag.
    *   **AES-256 CBC (Cipher Block Chaining):** Employed within the key wrapping protocol for securing key exchange.

**Key Hierarchy:**
1.  **Data Encryption Keys (DEK):** Randomly generated 128-bit AES keys used to encrypt individual files.
2.  **Group Keys:** 256-bit keys that protect the DEKs. These allow for efficient access sharing by managing access to the Group Key rather than re-encrypting the entire file payload.

## Secure File Storage and IPFS Integration
The system implements a decentralized storage strategy using **IPFS (InterPlanetary File System)**, ensuring data immutability and availability.

**File Upload Workflow:**
1.  **Verification:** The system validates the sender's ECDSA signature and nonce to prevent replay attacks.
2.  **Key Generation & Encryption:** A unique DEK is generated for the file. The file content is encrypted using AES-128 GCM.
3.  **Encrypted Key Storage:** The DEK is encrypted using the active Group Key and stored as metadata.
4.  **Decentralized Storage:** The encrypted file payload is uploaded to the IPFS node, returning a Content Identifier (CID).
5.  **Record Creation:** A record is committed to the database linking the CID, the encrypted DEK, and the associated Group ID.

**File Download Workflow:**
1.  **Access Check:** The system verifies the user's membership in the target group and validates their signature.
2.  **Data Retrieval:** The encrypted payload is fetched from IPFS using the CID.
3.  **Decryption:** The system decrypts the DEK using the Group Key, then uses the DEK to decrypt the file content, returning the raw data to the authenticated user.

## Access Control and Key Rotation
A robust access control mechanism is implemented to manage data sharing between entities (e.g., Doctors, Groups).

**Granting Access (Key Encapsulation):**
To share data, the system performs an **ECIES (Elliptic Curve Integrated Encryption Scheme)** variant exchange:
1.  The Group Owner initiates an access grant request.
2.  The system derives a shared secret using **ECDH (Elliptic Curve Diffie-Hellman)** between the owner's private key and the recipient's public key.
3.  The Group Key is encrypted with this shared secret and stored for the recipient, allowing them to access all files protected by that Group Key without exposing the key itself.

**Revoking Access (Key Rotation):**
Revocation is handled via immediate cryptographic key rotation to ensure forward secrecy:
1.  **Status Update:** The specific access entry is marked as `REVOKED`.
2.  **Key Regeneration:** A new Group Key is generated.
3.  **Re-encryption:** The DEK (protected by the old Group Key) is decrypted and immediately re-encrypted with the *new* Group Key. This effectively locks out any users who only possess the old Group Key.

## Notification and Hospital Integration
The Hospital module interacts with the KMS via a dedicated `KmsClientService`. Asynchronous workflows are managed via a notification system, where events (like access requests) trigger database notifications. These notifications serve as the state carrier for multi-step approvals, ensuring that access is only granted after explicit user or administrator approval.
