CREATE TABLE patient_credentials (
    id         BIGSERIAL PRIMARY KEY,
    patient_id BIGINT UNIQUE NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
