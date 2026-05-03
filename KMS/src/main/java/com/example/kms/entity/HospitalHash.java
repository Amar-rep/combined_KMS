package com.example.kms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "hospital_hashes")
public class HospitalHash {

    @Id
    @Column(name = "hospital_id", nullable = false, length = 50)
    private String hospitalId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false, insertable = false, updatable = false)
    @JsonIgnore
    private Hospital hospital;

    @Column(name = "hospital_hash", nullable = false, columnDefinition = "TEXT")
    private String hospitalHash;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
