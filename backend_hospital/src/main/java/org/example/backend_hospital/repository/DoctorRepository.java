package org.example.backend_hospital.repository;

import org.example.backend_hospital.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByDoctorIdKeccak(String doctorIdKeccak);

    List<Doctor> findByDepartmentId(Long departmentId);
}
