package com.pharmaflow.service;

import java.util.List;

import com.pharmaflow.dto.request.ProcessPaymentRequest;
import com.pharmaflow.dto.request.RazorpayVerifyRequest;
import com.pharmaflow.dto.response.AdminPaymentResponse;
import com.pharmaflow.dto.response.PaymentResponse;
import com.pharmaflow.dto.response.RazorpayOrderResponse;

public interface PaymentService {

    List<AdminPaymentResponse> getAllPayments();

    PaymentResponse processPayment(Long userId, ProcessPaymentRequest request);

    RazorpayOrderResponse createRazorpayOrder(Long userId, Long orderId);

    PaymentResponse verifyRazorpayPayment(Long userId, RazorpayVerifyRequest request);
}
