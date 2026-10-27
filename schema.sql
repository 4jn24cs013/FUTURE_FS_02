CREATE DATABASE IF NOT EXISTS mini_crm;

USE mini_crm;

CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'New',
    follow_up_date DATE,
    notes TEXT
);