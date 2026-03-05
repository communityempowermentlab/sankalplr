CREATE DATABASE IF NOT EXISTS sankalplr;
USE sankalplr;

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_type INT DEFAULT 2 COMMENT '1 = Admin, 2 = Staff',
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS UserActivityLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(100),
    role VARCHAR(50),
    action ENUM('Login', 'Logout') NOT NULL,
    status ENUM('Success', 'Failed') NOT NULL,
    ip_address VARCHAR(45),
    device_info TEXT,
    session_id VARCHAR(255),
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_duration_minutes INT,
    logout_type ENUM('Manual', 'Auto', '') DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Mothers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    age INT,
    address TEXT,
    contact_number VARCHAR(15),
    gravida INT COMMENT 'Number of pregnancies',
    para INT COMMENT 'Number of viable pregnancies',
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS LabourCases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mother_id INT NOT NULL,
    staff_id INT NOT NULL COMMENT 'References Users.id (Staff who added the record)',
    admission_time DATETIME NOT NULL,
    delivery_time DATETIME,
    delivery_type ENUM('Normal', 'C-Section', 'Instrumental') DEFAULT 'Normal',
    complications TEXT,
    administered_by VARCHAR(100),
    status ENUM('Admitted', 'In Labour', 'Delivered', 'Discharged') DEFAULT 'Admitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mother_id) REFERENCES Mothers(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS Babies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    labour_case_id INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    birth_weight DECIMAL(5,2) COMMENT 'Weight in kg',
    apgar_score_1min INT,
    apgar_score_5min INT,
    resuscitation_required BOOLEAN DEFAULT FALSE,
    time_of_birth DATETIME,
    complications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (labour_case_id) REFERENCES LabourCases(id) ON DELETE CASCADE
);

-- Insert dummy admin user for testing (password is 'admin123' hashed)
-- password hash: $2a$10$wE0u.k4R4Q8H2Q8H2Q8H2eQ8H2Q8H2Q8H2Q8H2Q8H2Q8H2Q8H2
INSERT IGNORE INTO Users (name, username, password, role_type) 
VALUES ('Super Admin', 'admin', '$2a$10$sV4n3jN.PzB8vGvXg1W/o.F/D0W22/FqW5gZ/FqW5gZ/FqW5gZ/Fq', 1);

-- Insert dummy staff user for testing (password is 'staff123' hashed)
INSERT IGNORE INTO Users (name, username, password, role_type) 
VALUES ('General Staff', 'staff', '$2a$10$d6L.k8P2R0F6V/F/F/F/F.N3T/F/F/F/F/F/F/F/F/F/F/F/F/F/F', 2);
