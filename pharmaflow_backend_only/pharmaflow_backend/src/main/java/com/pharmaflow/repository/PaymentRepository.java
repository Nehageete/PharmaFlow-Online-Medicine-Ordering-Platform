package com.pharmaflow.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pharmaflow.entities.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // used to fetch the payment tied to a specific order (Order -> Payment is a OneToOne)
    Optional<Payment> findByOrder_OrderId(Long orderId);
}
