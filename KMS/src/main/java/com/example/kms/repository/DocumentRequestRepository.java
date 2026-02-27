package com.example.kms.repository;

import com.example.kms.entity.DocumentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {
    List<DocumentRequest> findByReceiverIdKeccak_UserIdKeccak(String receiverIdKeccak);

    List<DocumentRequest> findBySenderIdKeccak_UserIdKeccak(String senderIdKeccak);

    List<DocumentRequest> findByReceiverIdKeccak_UserIdKeccakAndStatus(String receiverIdKeccak, String status);
}
