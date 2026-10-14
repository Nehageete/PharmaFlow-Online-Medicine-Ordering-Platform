package com.pharmaflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaflow.dto.request.ProcessPaymentRequest;
import com.pharmaflow.dto.request.RazorpayVerifyRequest;
import com.pharmaflow.service.PaymentService;
import com.pharmaflow.util.SecurityUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Validated
public class CustomerPaymentController {

    private final PaymentService paymentService;

    // POST /payments/process | CUSTOMER only
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        return ResponseEntity.ok(paymentService.processPayment(SecurityUtil.getCurrentUserId(), request));
    }

    // POST /payments/create-razorpay-order/{orderId} | CUSTOMER only
    @PostMapping("/create-razorpay-order/{orderId}")
    public ResponseEntity<?> createRazorpayOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.createRazorpayOrder(SecurityUtil.getCurrentUserId(), orderId));
    }

    // POST /payments/verify-razorpay-payment | CUSTOMER only
    @PostMapping("/verify-razorpay-payment")
    public ResponseEntity<?> verifyRazorpayPayment(@Valid @RequestBody RazorpayVerifyRequest request) {
        return ResponseEntity.ok(paymentService.verifyRazorpayPayment(SecurityUtil.getCurrentUserId(), request));
    }
}
