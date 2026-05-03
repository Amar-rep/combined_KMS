package com.example.kms.repository;

import com.example.kms.entity.HospitalHash;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HospitalHashRepository extends JpaRepository<HospitalHash, String> {
}
