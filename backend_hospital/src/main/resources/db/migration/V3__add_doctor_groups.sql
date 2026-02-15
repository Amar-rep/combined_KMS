-- V3: Add doctor_groups table

CREATE TABLE doctor_groups (
    id SERIAL PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    doctor_keccak VARCHAR(64) NOT NULL REFERENCES doctors(doctor_id_keccak) ON DELETE CASCADE,
    group_key_base64 TEXT NOT NULL,
    group_key_base64_enc TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, doctor_keccak)
);

CREATE INDEX idx_doctor_groups_group ON doctor_groups(group_id);
CREATE INDEX idx_doctor_groups_doctor ON doctor_groups(doctor_keccak);
