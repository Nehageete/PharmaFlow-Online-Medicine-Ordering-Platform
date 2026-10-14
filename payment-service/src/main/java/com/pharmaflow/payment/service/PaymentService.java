package com.pharmaflow.payment.service;

import com.pharmaflow.payment.dto.request.PaymentRequest;
import com.pharmaflow.payment.dto.response.CreatePaymentResponse;
import com.pharmaflow.payment.dto.response.PaymentResponse;

import java.util.List;

public interface PaymentService {
    CreatePaymentResponse createPayment(PaymentRequest paymentRequest);
    PaymentResponse getPaymentById(Long paymentId);
    PaymentResponse getPaymentByOrderId(Long orderId);
    List<PaymentResponse> getPaymentsByUserId(Long userId);
    List<PaymentResponse> getAllPayments();
    PaymentResponse refundPayment(Long paymentId);
}
