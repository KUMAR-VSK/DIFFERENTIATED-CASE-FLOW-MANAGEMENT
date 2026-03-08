-- Differentiated Case Flow Management System - Schema Script
-- This script ensures all tables are created correctly in MySQL

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    court_level VARCHAR(50),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Court Cases table
CREATE TABLE IF NOT EXISTS court_cases (
    id BIGINT NOT NULL AUTO_INCREMENT,
    case_number VARCHAR(255) NOT NULL UNIQUE,
    case_sequence INT NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    case_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    court_level VARCHAR(50) NOT NULL,
    original_case_id BIGINT,
    escalation_reason VARCHAR(255),
    escalation_date DATETIME(6),
    filing_date DATETIME(6) NOT NULL,
    hearing_date DATETIME(6),
    priority INT NOT NULL,
    estimated_duration_days INT,
    resource_requirement VARCHAR(255),
    notes TEXT,
    documents TEXT,
    assigned_judge_id BIGINT,
    assigned_advocate_id BIGINT,
    filing_clerk_id BIGINT,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_case_number (case_number),
    INDEX idx_status (status),
    INDEX idx_case_type (case_type),
    INDEX idx_court_level (court_level),
    INDEX idx_priority (priority),
    INDEX idx_filing_date (filing_date),
    INDEX idx_hearing_date (hearing_date),
    INDEX idx_assigned_judge (assigned_judge_id),
    INDEX idx_status_priority (status, priority),
    INDEX idx_court_status (court_level, status),
    FOREIGN KEY (assigned_judge_id) REFERENCES users(id),
    FOREIGN KEY (assigned_advocate_id) REFERENCES users(id),
    FOREIGN KEY (filing_clerk_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Case Audit table
CREATE TABLE IF NOT EXISTS case_audit (
    id BIGINT NOT NULL AUTO_INCREMENT,
    case_id BIGINT NOT NULL,
    case_number VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    description VARCHAR(1000),
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    previous_court_level VARCHAR(50),
    new_court_level VARCHAR(50),
    performed_by_id BIGINT,
    details VARCHAR(2000),
    ip_address VARCHAR(255),
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (case_id) REFERENCES court_cases(id),
    FOREIGN KEY (performed_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Case Notes table
CREATE TABLE IF NOT EXISTS case_notes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    case_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    note_type VARCHAR(50) NOT NULL,
    created_by_id BIGINT NOT NULL,
    is_finalized BOOLEAN DEFAULT FALSE,
    finalized_at DATETIME(6),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    FOREIGN KEY (case_id) REFERENCES court_cases(id),
    FOREIGN KEY (created_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Case Checklist Items table
CREATE TABLE IF NOT EXISTS case_checklist_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    case_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    step_number INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    is_mandatory BOOLEAN DEFAULT FALSE,
    completed_by_id BIGINT,
    completed_at DATETIME(6),
    due_date DATETIME(6),
    created_at DATETIME(6),
    notes VARCHAR(1000),
    PRIMARY KEY (id),
    FOREIGN KEY (case_id) REFERENCES court_cases(id),
    FOREIGN KEY (completed_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Case Templates table
CREATE TABLE IF NOT EXISTS case_templates (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(1000),
    case_type VARCHAR(50) NOT NULL,
    court_level VARCHAR(50),
    default_priority INT,
    estimated_duration_days INT,
    required_documents TEXT,
    checklist_items TEXT,
    mandatory_fields VARCHAR(2000),
    workflow_steps TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Documents table
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    original_file_name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    url VARCHAR(255) NOT NULL,
    metadata TEXT,
    case_id BIGINT NOT NULL,
    uploaded_by_id BIGINT,
    document_type VARCHAR(50) NOT NULL,
    upload_date DATETIME(6) NOT NULL,
    created_at DATETIME(6),
    PRIMARY KEY (id),
    FOREIGN KEY (case_id) REFERENCES court_cases(id),
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Document Versions table
CREATE TABLE IF NOT EXISTS document_versions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    document_id BIGINT NOT NULL,
    version_number INT NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_size BIGINT,
    change_description VARCHAR(1000),
    uploaded_by_id BIGINT,
    upload_date DATETIME(6) NOT NULL,
    checksum VARCHAR(255),
    is_current BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id),
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Document Approvals table
CREATE TABLE IF NOT EXISTS document_approvals (
    id BIGINT NOT NULL AUTO_INCREMENT,
    document_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    comments VARCHAR(2000),
    reviewed_at DATETIME(6),
    requested_at DATETIME(6) NOT NULL,
    approval_level INT DEFAULT 1,
    PRIMARY KEY (id),
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
