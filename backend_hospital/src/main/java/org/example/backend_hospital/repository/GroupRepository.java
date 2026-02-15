package org.example.backend_hospital.repository;

import org.example.backend_hospital.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Integer> {
    Optional<Group> findByGroupId(String groupId);

    List<Group> findByUserPatientIdKeccak(String userIdKeccak);
}
