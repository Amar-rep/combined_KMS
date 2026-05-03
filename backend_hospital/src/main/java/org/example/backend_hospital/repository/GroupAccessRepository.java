package org.example.backend_hospital.repository;

import org.example.backend_hospital.entity.GroupAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupAccessRepository extends JpaRepository<GroupAccess, Long> {

    List<GroupAccess> findByHospitalId(String hospitalId);

    List<GroupAccess> findByDoctor_DoctorIdKeccakAndHospitalId(String doctorKeccak, String hospitalId);

    List<GroupAccess> findByGroup_User_PatientIdKeccakAndHospitalId(String patientKeccak, String hospitalId);

    Optional<GroupAccess> findByGroup_GroupIdAndDoctor_DoctorIdKeccakAndHospitalId(
            String groupId, String doctorKeccak, String hospitalId);
}
