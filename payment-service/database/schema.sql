-- Create Database
CREATE DATABASE IF NOT EXISTS payment_db;
USE payment_db;

-- Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    payment_date DATETIME NOT NULL,
    gateway_response VARCHAR(1000),
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_id (transaction_id)
);

-- Sample Data
INSERT INTO payments (order_id, user_id, amount, payment_method, payment_status, transaction_id, payment_date, gateway_response)
VALUES
(1, 1, 250.00, 'ONLINE', 'SUCCESS', 'TXN123456789ABC', NOW(), 'Gateway: PharmaFlow Payment Gateway v1.0 | Transaction ID: TXN123456789ABC | Status: SUCCESS'),
(2, 1, 450.00, 'COD', 'PENDING', 'TXN987654321XYZ', NOW(), 'COD - Payment will be collected on delivery'),
(3, 2, 320.00, 'ONLINE', 'SUCCESS', 'TXN111222333AAA', NOW(), 'Gateway: PharmaFlow Payment Gateway v1.0 | Transaction ID: TXN111222333AAA | Status: SUCCESS');
