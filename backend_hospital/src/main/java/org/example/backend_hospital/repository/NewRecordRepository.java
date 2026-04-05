package org.example.backend_hospital.repository;

import org.example.backend_hospital.entity.NewRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewRecordRepository extends JpaRepository<NewRecord, Long> {
    List<NewRecord> findByGroupIdOrderByUploadedAtDesc(String groupId);
    List<NewRecord> findByPatientKeccakOrderByUploadedAtDesc(String patientKeccak);
}
