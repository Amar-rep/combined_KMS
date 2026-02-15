package com.example.kms.repository;

import com.example.kms.entity.Record;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordRepository extends JpaRepository<Record, String> {
    List<Record> findByGroupKey_GroupId(String groupId);
}
