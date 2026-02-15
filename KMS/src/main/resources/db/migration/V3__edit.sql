ALTER TABLE hospitals
    ADD COLUMN IF NOT EXISTS hospital_keyBase64 TEXT;