package com.pharmaflow.payment.repository;

import com.pharmaflow.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    boolean existsByOrderId(Long orderId);
    List<Payment> findByUserId(Long userId);
}
