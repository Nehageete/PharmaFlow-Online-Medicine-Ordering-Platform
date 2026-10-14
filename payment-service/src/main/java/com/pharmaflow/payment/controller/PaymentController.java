package com.pharmaflow.payment.controller;

import com.pharmaflow.payment.dto.request.PaymentRequest;
import com.pharmaflow.payment.dto.response.CreatePaymentResponse;
import com.pharmaflow.payment.dto.response.PaymentResponse;
import com.pharmaflow.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<CreatePaymentResponse> createPayment(@Valid @RequestBody PaymentRequest paymentRequest) {
        log.info("Received payment request for order: {}", paymentRequest.getOrderId());
        CreatePaymentResponse response = paymentService.createPayment(paymentRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long paymentId) {
        log.info("Fetching payment details for payment ID: {}", paymentId);
        PaymentResponse response = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(@PathVariable Long orderId) {
        log.info("Fetching payment details for order ID: {}", orderId);
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByUserId(@PathVariable Long userId) {
        log.info("Fetching payment history for user ID: {}", userId);
        List<PaymentResponse> responses = paymentService.getPaymentsByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        log.info("Fetching all payments");
        List<PaymentResponse> responses = paymentService.getAllPayments();
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(@PathVariable Long paymentId) {
        log.info("Processing refund for payment ID: {}", paymentId);
        PaymentResponse response = paymentService.refundPayment(paymentId);
        return ResponseEntity.ok(response);
    }
}
