package com.pharmaflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaflow.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;

    // Desc - list every payment record with order + customer context (Admin "Payments" screen)
    // URI - GET /admin/payments | ADMIN only (covered by the "/admin/**" security rule)
    @GetMapping
    public ResponseEntity<?> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
