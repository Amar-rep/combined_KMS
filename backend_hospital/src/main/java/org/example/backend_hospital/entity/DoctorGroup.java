package org.example.backend_hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.OffsetDateTime;

@Entity
@Table(name = "doctor_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "group_id", referencedColumnName = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "doctor_keccak", referencedColumnName = "doctor_id_keccak", nullable = false)
    private Doctor doctor;

    @Column(name = "group_key_base64", nullable = false, columnDefinition = "TEXT")
    private String groupKeyBase64;

    @Column(name = "group_key_base64_enc", nullable = false, columnDefinition = "TEXT")
    private String groupKeyBase64Enc;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
