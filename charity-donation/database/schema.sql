-- ======================================================
-- CHARITY DONATION PLATFORM DATABASE SCHEMA
-- ======================================================

CREATE DATABASE IF NOT EXISTS charity_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE charity_db;

-- ======================================================
-- USERS
-- ======================================================

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(255) NULL,
    google_sub VARCHAR(255) NULL,

    role ENUM('USER','FOUNDER','ADMIN') DEFAULT 'USER',

    linked_wallet VARCHAR(100) NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================
-- CATEGORIES
-- ======================================================

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) UNIQUE NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================
-- PROJECTS
-- ======================================================

CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    founder_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    goal_amount DECIMAL(18,2) NOT NULL,

    status ENUM(
        'DRAFT',
        'PENDING',
        'APPROVED',
        'PUBLISHED',
        'REJECTED',
        'ARCHIVED'
    ) DEFAULT 'DRAFT',

    cover_image_url VARCHAR(500),

    vault_address VARCHAR(100),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (founder_id) REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_projects_founder ON projects(founder_id);
CREATE INDEX idx_projects_category ON projects(category_id);

-- ======================================================
-- PROJECT APPROVALS
-- ======================================================

CREATE TABLE project_approvals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    project_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,

    decision ENUM('APPROVED','REJECTED') NOT NULL,

    note TEXT,

    decided_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE,

    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- ======================================================
-- DONATIONS
-- ======================================================

CREATE TABLE donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    project_id BIGINT NOT NULL,
    user_id BIGINT NULL,

    donor_wallet VARCHAR(100),

    amount DECIMAL(18,2) NOT NULL,

    donation_type ENUM('CRYPTO', 'BANKING') NOT NULL DEFAULT 'CRYPTO',

    token_address VARCHAR(255),

    status ENUM(
        'PENDING',
        'CONFIRMED',
        'FAILED'
    ) DEFAULT 'PENDING',

    vnp_txn_ref VARCHAR(255) NULL,
    vnp_transaction_no VARCHAR(255) NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME NULL,

    FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_donations_project ON donations(project_id);
CREATE INDEX idx_donations_user ON donations(user_id);
CREATE INDEX idx_donations_vnp_txn_ref ON donations(vnp_txn_ref);

-- ======================================================
-- WITHDRAW REQUESTS
-- ======================================================

CREATE TABLE withdraw_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    project_id BIGINT NOT NULL,
    founder_id BIGINT NOT NULL,

    amount DECIMAL(18,2) NOT NULL,

    status ENUM(
        'PENDING',
        'APPROVED',
        'REJECTED',
        'CLAIMED'
    ) DEFAULT 'PENDING',

    note TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE,

    FOREIGN KEY (founder_id) REFERENCES users(id)
);

CREATE INDEX idx_withdraw_project ON withdraw_requests(project_id);

-- ======================================================
-- WITHDRAW APPROVALS
-- ======================================================

CREATE TABLE withdraw_approvals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    withdraw_request_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,

    decision ENUM('APPROVED','REJECTED') NOT NULL,

    admin_signature VARCHAR(500),

    nonce BIGINT,

    decided_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (withdraw_request_id)
        REFERENCES withdraw_requests(id)
        ON DELETE CASCADE,

    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- ======================================================
-- ONCHAIN CLAIMS
-- ======================================================

CREATE TABLE onchain_claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    withdraw_request_id BIGINT NOT NULL,

    claim_tx_hash VARCHAR(255) UNIQUE,

    status ENUM(
        'PENDING',
        'CONFIRMED',
        'FAILED'
    ) DEFAULT 'PENDING',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME NULL,

    FOREIGN KEY (withdraw_request_id)
        REFERENCES withdraw_requests(id)
        ON DELETE CASCADE
);

-- ======================================================
-- PROJECT UPDATES (NEW TABLE)
-- ======================================================

CREATE TABLE project_updates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    project_id BIGINT NOT NULL,

    author_id BIGINT NOT NULL,

    title VARCHAR(255),

    content TEXT,

    image_url VARCHAR(500),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    FOREIGN KEY (author_id)
        REFERENCES users(id)
);

CREATE INDEX idx_updates_project ON project_updates(project_id);

-- ======================================================
-- SAMPLE DATA (OPTIONAL)
-- ======================================================

INSERT INTO categories (name)
VALUES
('Education'),
('Healthcare'),
('Disaster Relief'),
('Environment'),
('Community Support');