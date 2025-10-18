-- ============================================================================
-- Student Management System - Database Schema
--
-- Purpose:
--   Defines core tables, constraints, triggers, seed data, and (dev) helpers.
--   Script is safe to rerun: uses IF NOT EXISTS / idempotent inserts.
--
-- Usage:
--   psql -U postgres -h localhost -d student_management -f database/schema.sql
--
-- Best practices applied:
--   - Explicit constraints (NOT NULL, UNIQUE)
--   - Updated-at trigger to maintain audit fields
--   - Idempotent seed data (ON CONFLICT DO NOTHING)
--   - Performance indexes for frequent queries (ILIKE, is_active)
--   - Table/column documentation via COMMENT statements
--   - Optional dev-only truncate (clears tables before reseed)
-- ============================================================================
-- NOTE: Create the database manually if it doesn't exist.
-- CREATE DATABASE student_management;
-- Then connect to it before running the rest.

-- Development convenience: clear existing tables if they already exist.
-- This makes repeated local runs of this script deterministic.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'students'
  ) THEN
    EXECUTE 'TRUNCATE TABLE students RESTART IDENTITY CASCADE';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    EXECUTE 'TRUNCATE TABLE users RESTART IDENTITY CASCADE';
  END IF;
END $$;

-- Transactions improve safety when running as a whole file.
BEGIN;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Application users for authentication';
COMMENT ON COLUMN users.username IS 'Unique username used for login/identification';
COMMENT ON COLUMN users.email IS 'Unique email address for the user';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hash of the user password';
COMMENT ON COLUMN users.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN users.updated_at IS 'Record last update timestamp (maintained by trigger)';

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    course VARCHAR(255),
    enrolment_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE students IS 'Students enrolled/managed by the system';
COMMENT ON COLUMN students.name IS 'Full name of the student';
COMMENT ON COLUMN students.email IS 'Unique email address of the student';
COMMENT ON COLUMN students.phone IS 'Phone number for contact';
COMMENT ON COLUMN students.course IS 'Primary course enrolled';
COMMENT ON COLUMN students.enrolment_date IS 'Date of enrolment';
COMMENT ON COLUMN students.is_active IS 'Soft-delete flag: TRUE=active, FALSE=deactivated';
COMMENT ON COLUMN students.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN students.updated_at IS 'Record last update timestamp (maintained by trigger)';

-- updated_at triggers (Postgres doesn't support ON UPDATE CURRENT_TIMESTAMP directly)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_set_updated_at_trg'
  ) THEN
    CREATE TRIGGER users_set_updated_at_trg
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'students_set_updated_at_trg'
  ) THEN
    CREATE TRIGGER students_set_updated_at_trg
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- Performance indexes
-- Note: Queries filter active students by name with ILIKE, so we add:
--   1) Composite btree on (is_active, name) for ordered scans
--   2) Trigram index for fast ILIKE matching (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_students_active_name ON students (is_active, name);
CREATE INDEX IF NOT EXISTS idx_students_name_trgm ON students USING gin (name gin_trgm_ops);

-- Insert a sample user for testing (password: admin123)
INSERT INTO users (username, email, password_hash) 
VALUES ('admin', 'admin@example.com', '$2b$10$hTyrSIXmo5Xd1RoQm4KczO9beRVSNox4uNiw8A8X4VRNqvlKLlOzC')
ON CONFLICT (username) DO NOTHING;

-- Sample students (idempotent seed)
INSERT INTO students (name, email, phone, course, enrolment_date, is_active) VALUES
  ('Alice Johnson', 'alice.johnson@example.com', '+1-202-555-0101', 'Computer Science', '2024-01-15', true),
  ('Brian Lee', 'brian.lee@example.com', '+1-202-555-0102', 'Information Systems', '2023-09-05', true),
  ('Carla Gomez', 'carla.gomez@example.com', '+1-202-555-0103', 'Mathematics', '2023-02-20', true),
  ('Daniel Wu', 'daniel.wu@example.com', '+1-202-555-0104', 'Physics', '2022-08-29', false),
  ('Eva Patel', 'eva.patel@example.com', '+1-202-555-0105', 'Chemistry', '2024-03-11', true),
  ('Farah Khan', 'farah.khan@example.com', '+1-202-555-0106', 'Biology', '2023-11-02', true),
  ('George Smith', 'george.smith@example.com', '+1-202-555-0107', 'History', '2022-01-10', false),
  ('Hannah Brown', 'hannah.brown@example.com', '+1-202-555-0108', 'Economics', '2024-06-01', true),
  ('Ivan Petrov', 'ivan.petrov@example.com', '+1-202-555-0109', 'Business Administration', '2023-04-18', true),
  ('Julia Rossi', 'julia.rossi@example.com', '+1-202-555-0110', 'English Literature', '2021-09-13', false)
ON CONFLICT (email) DO NOTHING;

COMMIT;

