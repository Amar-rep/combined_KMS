-- V2: Add groups table

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    user_id_keccak VARCHAR(64) NOT NULL REFERENCES patients(patient_id_keccak) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_groups_group_id ON groups(group_id);
CREATE INDEX idx_groups_user_keccak ON groups(user_id_keccak);
