package com.example.kms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "hospitals")
public class Hospital {
    @Id
    @Column(name = "hospital_id", nullable = false, length = 50)
    private String hospitalId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "location", length = Integer.MAX_VALUE)
    private String location;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "hospital_keybase64", length = Integer.MAX_VALUE)
    private String hospitalKeybase64;


}