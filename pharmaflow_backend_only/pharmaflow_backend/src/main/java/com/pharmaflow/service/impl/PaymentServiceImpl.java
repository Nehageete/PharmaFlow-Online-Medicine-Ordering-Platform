package com.pharmaflow.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmaflow.dto.request.ProcessPaymentRequest;
import com.pharmaflow.dto.request.RazorpayVerifyRequest;
import com.pharmaflow.dto.response.AdminPaymentResponse;
import com.pharmaflow.dto.response.PaymentResponse;
import com.pharmaflow.dto.response.RazorpayOrderResponse;
import com.pharmaflow.entities.Order;
import com.pharmaflow.entities.Payment;
import com.pharmaflow.enums.PaymentMethod;
import com.pharmaflow.enums.PaymentStatus;
import com.pharmaflow.exception.InvalidOperationException;
import com.pharmaflow.exception.ResourceNotFoundException;
import com.pharmaflow.repository.OrderRepository;
import com.pharmaflow.repository.PaymentRepository;
import com.pharmaflow.service.PaymentService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Value("${razorpay.key.id:rzp_test_TMAWYFG6JUtyio}")
    private String razorpayKeyId;

    @Override
    @Transactional(readOnly = true)
    public List<AdminPaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .sorted(Comparator.comparing(Payment::getPaymentDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toAdminResponse)
                .toList();
    }

    @Override
    public PaymentResponse processPayment(Long userId, ProcessPaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        if (!order.getUser().getUserId().equals(userId)) {
            throw new InvalidOperationException("You are not authorized to process payment for this order");
        }

        Payment payment = order.getPayment();
        if (payment == null) {
            payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(order.getTotalAmount());
        }

        String txnId = request.getTransactionId();
        if (txnId == null || txnId.trim().isEmpty()) {
            txnId = "TXN_PHARMA_" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        }

        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setTransactionId(txnId);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setGatewayName("RAZORPAY_SIMULATED");

        Payment savedPayment = paymentRepository.save(payment);
        return toPaymentResponse(savedPayment);
    }

    @Override
    public RazorpayOrderResponse createRazorpayOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getUserId().equals(userId)) {
            throw new InvalidOperationException("You are not authorized to initiate payment for this order");
        }

        BigDecimal amount = order.getTotalAmount();
        int amountInPaise = amount.multiply(new BigDecimal(100)).intValue();
        String rzpOrderId = "order_rzp_" + UUID.randomUUID().toString().substring(0, 12);

        return new RazorpayOrderResponse(rzpOrderId, amount, amountInPaise, "INR", razorpayKeyId, orderId);
    }

    @Override
    public PaymentResponse verifyRazorpayPayment(Long userId, RazorpayVerifyRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        if (!order.getUser().getUserId().equals(userId)) {
            throw new InvalidOperationException("You are not authorized to verify payment for this order");
        }

        Payment payment = order.getPayment();
        if (payment == null) {
            payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(order.getTotalAmount());
        }

        payment.setPaymentMethod(PaymentMethod.ONLINE);
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setTransactionId(request.getRazorpayPaymentId());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setGatewayName("RAZORPAY");

        Payment savedPayment = paymentRepository.save(payment);
        return toPaymentResponse(savedPayment);
    }

    private AdminPaymentResponse toAdminResponse(Payment payment) {
        AdminPaymentResponse response = new AdminPaymentResponse();
        response.setPaymentId(payment.getPaymentId());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentDate(payment.getPaymentDate());
        response.setGatewayName(payment.getGatewayName());

        if (payment.getOrder() != null) {
            response.setOrderId(payment.getOrder().getOrderId());
            if (payment.getOrder().getUser() != null) {
                response.setCustomerName(payment.getOrder().getUser().getFirstName() + " " + payment.getOrder().getUser().getLastName());
                response.setCustomerEmail(payment.getOrder().getUser().getEmail());
            }
        }
        return response;
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(payment.getPaymentId());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentDate(payment.getPaymentDate());
        response.setGatewayName(payment.getGatewayName());
        return response;
    }
}
