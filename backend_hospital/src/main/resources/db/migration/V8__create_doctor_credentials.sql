CREATE TABLE doctor_credentials (
    id         BIGSERIAL PRIMARY KEY,
    doctor_id  BIGINT UNIQUE NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
