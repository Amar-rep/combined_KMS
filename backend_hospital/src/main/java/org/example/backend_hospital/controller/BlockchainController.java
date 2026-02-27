package org.example.backend_hospital.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_hospital.dto.BlockchainReceiptDTO;
import org.example.backend_hospital.service.BlockchainService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/blockchain")
@RequiredArgsConstructor
public class BlockchainController {

    private final BlockchainService blockchainService;

    /**
     * POST /api/blockchain/register-user
     * Body: { "userId": "...", "role": "...", "isActive": true, "meta": "..." }
     * Returns: BlockchainReceiptDTO with decoded UserRegistered event.
     */
    @PostMapping("/register-user")
    public ResponseEntity<BlockchainReceiptDTO> registerUser(@RequestBody Map<String, Object> payload)
            throws Exception {
        String userId = (String) payload.get("userId");
        String role = (String) payload.get("role");
        Boolean isActive = (Boolean) payload.get("isActive");
        String meta = (String) payload.getOrDefault("meta", "{}");

        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("userId is required");
        if (role == null || role.isBlank())
            throw new IllegalArgumentException("role is required");
        if (isActive == null)
            throw new IllegalArgumentException("isActive is required");

        return ResponseEntity.ok(blockchainService.registerUser(userId, role, isActive, meta));
    }

    /**
     * POST /api/blockchain/record
     * Body: { "recordId": "...", "patientId": "...", "documentHash": "...",
     * "ipfsCid": "..." }
     * Returns: BlockchainReceiptDTO with decoded RecordAdded event.
     */
    @PostMapping("/record")
    public ResponseEntity<BlockchainReceiptDTO> addRecord(@RequestBody Map<String, String> payload) throws Exception {
        String recordId = payload.get("recordId");
        String patientId = payload.get("patientId");
        String documentHash = payload.get("documentHash");
        String ipfsCid = payload.get("ipfsCid");

        if (recordId == null || recordId.isBlank())
            throw new IllegalArgumentException("recordId is required");
        if (patientId == null || patientId.isBlank())
            throw new IllegalArgumentException("patientId is required");
        if (documentHash == null || documentHash.isBlank())
            throw new IllegalArgumentException("documentHash is required");
        if (ipfsCid == null || ipfsCid.isBlank())
            throw new IllegalArgumentException("ipfsCid is required");

        return ResponseEntity.ok(blockchainService.addRecord(recordId, patientId, documentHash, ipfsCid));
    }

    /**
     * POST /api/blockchain/access/grant
     * Body: { "recordId": "...", "doctorId": "..." }
     * Returns: BlockchainReceiptDTO with decoded AccessGranted event.
     */
    @PostMapping("/access/grant")
    public ResponseEntity<BlockchainReceiptDTO> grantAccess(@RequestBody Map<String, String> payload) throws Exception {
        String recordId = payload.get("recordId");
        String doctorId = payload.get("doctorId");

        if (recordId == null || recordId.isBlank())
            throw new IllegalArgumentException("recordId is required");
        if (doctorId == null || doctorId.isBlank())
            throw new IllegalArgumentException("doctorId is required");

        return ResponseEntity.ok(blockchainService.grantAccess(recordId, doctorId));
    }

    /**
     * POST /api/blockchain/access/revoke
     * Body: { "recordId": "...", "doctorId": "..." }
     * Returns: BlockchainReceiptDTO with decoded AccessRevoked event.
     */
    @PostMapping("/access/revoke")
    public ResponseEntity<BlockchainReceiptDTO> revokeAccess(@RequestBody Map<String, String> payload)
            throws Exception {
        String recordId = payload.get("recordId");
        String doctorId = payload.get("doctorId");

        if (recordId == null || recordId.isBlank())
            throw new IllegalArgumentException("recordId is required");
        if (doctorId == null || doctorId.isBlank())
            throw new IllegalArgumentException("doctorId is required");

        return ResponseEntity.ok(blockchainService.revokeAccess(recordId, doctorId));
    }

    /**
     * GET /api/blockchain/access/check?recordId=...&viewerId=...
     * Returns: true / false
     */
    @GetMapping("/access/check")
    public ResponseEntity<Boolean> checkAccess(
            @RequestParam String recordId,
            @RequestParam String viewerId) throws Exception {

        if (recordId == null || recordId.isBlank())
            throw new IllegalArgumentException("recordId is required");
        if (viewerId == null || viewerId.isBlank())
            throw new IllegalArgumentException("viewerId is required");

        return ResponseEntity.ok(blockchainService.canView(recordId, viewerId));
    }

    /**
     * GET /api/blockchain/merkle-root
     * Returns: The Merkle root anchoring hash of the chain.
     */
    @GetMapping("/merkle-root")
    public ResponseEntity<Map<String, String>> getChainMerkleRoot() throws Exception {
        return ResponseEntity.ok(Map.of("merkleRoot", blockchainService.getChainAnchoringHash()));
    }
}
