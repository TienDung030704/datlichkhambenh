DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS specialties;

CREATE TABLE specialties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR
(255) CHARACTER
SET utf8mb4
COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
    description LONGTEXT CHARACTER
SET utf8mb4
COLLATE utf8mb4_unicode_ci,
    doctor_count INT DEFAULT 10,
    total_doctors INT DEFAULT 10,
    price INT DEFAULT 150000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    specialty_id INT NOT NULL,
    full_name VARCHAR
(255) CHARACTER
SET utf8mb4
COLLATE utf8mb4_unicode_ci NOT NULL,
    email VARCHAR
(255),
    phone_number VARCHAR
(20),
    address VARCHAR
(255) CHARACTER
SET utf8mb4
COLLATE utf8mb4_unicode_ci,
    license_number VARCHAR
(100),
    experience DOUBLE DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY
(specialty_id) REFERENCES specialties
(id)
);
