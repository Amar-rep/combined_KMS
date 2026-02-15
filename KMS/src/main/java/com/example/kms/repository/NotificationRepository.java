package com.example.kms.repository;

import com.example.kms.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverIdKeccak_UserIdKeccak(String receiverIdKeccak);

    List<Notification> findByReceiverIdKeccak_UserIdKeccakAndStatus(String receiverIdKeccak, String status);

    List<Notification> findByReceiverIdKeccak_UserIdKeccakAndHospital_HospitalId(String receiverIdKeccak,
            String hospitalId);

    List<Notification> findByHospital_HospitalId(String hospitalId);
}
