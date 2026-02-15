package com.example.kms.repository;

import com.example.kms.entity.GroupAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupAccessRepository extends JpaRepository<GroupAccess, Long> {

    Optional<GroupAccess> findByGroupKey_GroupIdAndDoctor_UserIdKeccakAndHospital_HospitalId(
            String groupId, String doctorKeccak, String hospitalId);

    List<GroupAccess> findByHospital_HospitalIdAndDoctor_UserIdKeccak(String hospitalId, String doctorKeccak);

    List<GroupAccess> findByHospital_HospitalId(String hospitalId);

    List<GroupAccess> findByGroupKey_GroupId(String groupId);
}
