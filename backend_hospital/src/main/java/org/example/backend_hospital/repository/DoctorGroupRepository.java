package org.example.backend_hospital.repository;

import org.example.backend_hospital.entity.DoctorGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorGroupRepository extends JpaRepository<DoctorGroup, Integer> {
    List<DoctorGroup> findByGroupGroupId(String groupId);

    List<DoctorGroup> findByDoctorDoctorIdKeccak(String doctorKeccak);

    Optional<DoctorGroup> findByGroupGroupIdAndDoctorDoctorIdKeccak(String groupId, String doctorKeccak);
}
