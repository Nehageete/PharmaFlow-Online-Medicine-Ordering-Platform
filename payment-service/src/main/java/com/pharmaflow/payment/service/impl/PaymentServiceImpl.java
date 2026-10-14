package com.pharmaflow.payment.service.impl;

import com.pharmaflow.payment.dto.request.PaymentRequest;
import com.pharmaflow.payment.dto.response.CreatePaymentResponse;
import com.pharmaflow.payment.dto.response.PaymentResponse;
import com.pharmaflow.payment.entity.Payment;
import com.pharmaflow.payment.enums.PaymentMethod;
import com.pharmaflow.payment.enums.PaymentStatus;
import com.pharmaflow.payment.exception.InvalidPaymentOperationException;
import com.pharmaflow.payment.exception.PaymentAlreadyExistsException;
import com.pharmaflow.payment.exception.ResourceNotFoundException;
import com.pharmaflow.payment.repository.PaymentRepository;
import com.pharmaflow.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    @Value("${payment.gateway.name:PharmaFlow Payment Gateway v1.0}")
    private String gatewayName;

    @Value("${payment.gateway.simulation.enabled:true}")
    private boolean simulationEnabled;

    @Override
    public CreatePaymentResponse createPayment(PaymentRequest request) {
        log.info("Processing payment for Order #{} by User #{} with method: {}", 
                request.getOrderId(), request.getUserId(), request.getPaymentMethod());

        // 1. Idempotency / Duplicate Check
        if (paymentRepository.existsByOrderId(request.getOrderId())) {
            log.warn("Payment already exists for Order #{}", request.getOrderId());
            throw new PaymentAlreadyExistsException("Payment already exists for order: " + request.getOrderId());
        }

        PaymentStatus status;
        String txnId;
        String responseGatewayName = this.gatewayName;
        String gatewayResponse;
        String responseMessage;

        LocalDateTime now = LocalDateTime.now();
        String formattedTimestamp = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));

        // 2. Process based on Payment Method
        if (request.getPaymentMethod() == PaymentMethod.COD) {
            status = PaymentStatus.PENDING;
            txnId = "TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
            responseGatewayName = "COD";
            gatewayResponse = "COD - Payment will be collected on delivery";
            responseMessage = "COD payment registered. Pending delivery.";
        } else {
            // ONLINE payment
            if (request.getRazorpayPaymentId() != null && !request.getRazorpayPaymentId().trim().isEmpty()) {
                txnId = request.getRazorpayPaymentId().trim();
                status = PaymentStatus.SUCCESS;
                responseGatewayName = "Razorpay";
                gatewayResponse = String.format("Gateway: %s | Transaction ID: %s | Status: SUCCESS | Timestamp: %s",
                        responseGatewayName, txnId, formattedTimestamp);
                responseMessage = "Payment processed successfully via Razorpay";
            } else if (simulationEnabled) {
                // Simulation rule: based on last digit of (amount * 100) % 10
                // 0-7 => SUCCESS, 8-9 => FAILED
                long amountInCents = request.getAmount().multiply(new BigDecimal("100")).longValue();
                long lastDigit;
                if (amountInCents % 100 != 0) {
                    lastDigit = Math.abs(amountInCents % 10);
                } else {
                    lastDigit = Math.abs(request.getAmount().longValue() % 10);
                }

                txnId = "TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

                if (lastDigit >= 8) {
                    status = PaymentStatus.FAILED;
                    gatewayResponse = String.format("Gateway: %s | Transaction ID: %s | Status: FAILED | Reason: Simulated card decline | Timestamp: %s",
                            responseGatewayName, txnId, formattedTimestamp);
                    responseMessage = "Payment failed (simulated failure)";
                } else {
                    status = PaymentStatus.SUCCESS;
                    gatewayResponse = String.format("Gateway: %s | Transaction ID: %s | Status: SUCCESS | Timestamp: %s",
                            responseGatewayName, txnId, formattedTimestamp);
                    responseMessage = "Payment processed successfully";
                }
            } else {
                txnId = "TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
                status = PaymentStatus.SUCCESS;
                gatewayResponse = String.format("Gateway: %s | Transaction ID: %s | Status: SUCCESS | Timestamp: %s",
                        responseGatewayName, txnId, formattedTimestamp);
                responseMessage = "Payment processed successfully";
            }
        }

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .userId(request.getUserId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(status)
                .transactionId(txnId)
                .gatewayName(responseGatewayName)
                .gatewayResponse(gatewayResponse)
                .build();

        Payment saved = paymentRepository.save(payment);
        log.info("Payment #{} saved with status: {} and Txn ID: {}", 
                saved.getPaymentId(), saved.getPaymentStatus(), saved.getTransactionId());

        return CreatePaymentResponse.builder()
                .paymentId(saved.getPaymentId())
                .orderId(saved.getOrderId())
                .transactionId(saved.getTransactionId())
                .paymentStatus(saved.getPaymentStatus())
                .message(responseMessage)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public PaymentResponse refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));

        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new InvalidPaymentOperationException(
                    "Only successful payments can be refunded. Current status: " + payment.getPaymentStatus());
        }

        String refundTimestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        String currentResponse = payment.getGatewayResponse() != null ? payment.getGatewayResponse() : "";
        payment.setGatewayResponse(currentResponse + " | Refunded on: " + refundTimestamp);

        Payment updated = paymentRepository.save(payment);
        log.info("Payment #{} successfully refunded", updated.getPaymentId());
        return mapToResponse(updated);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .transactionId(payment.getTransactionId())
                .gatewayName(payment.getGatewayName())
                .gatewayResponse(payment.getGatewayResponse())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
