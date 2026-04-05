CREATE TABLE new_records (
    id BIGSERIAL PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL,
    patient_keccak VARCHAR(64) NOT NULL,
    doctor_keccak VARCHAR(64) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    file_data TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_new_records_group_id ON new_records(group_id);
CREATE INDEX idx_new_records_patient ON new_records(patient_keccak);
CREATE INDEX idx_new_records_doctor ON new_records(doctor_keccak);
