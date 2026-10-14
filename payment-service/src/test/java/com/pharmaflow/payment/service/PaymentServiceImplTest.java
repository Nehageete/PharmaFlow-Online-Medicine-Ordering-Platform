package com.pharmaflow.payment.service;

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
import com.pharmaflow.payment.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "gatewayName", "PharmaFlow Payment Gateway v1.0");
        ReflectionTestUtils.setField(paymentService, "simulationEnabled", true);
    }

    @Test
    void testCreatePayment_COD_StatusPending() {
        PaymentRequest request = PaymentRequest.builder()
                .orderId(101L)
                .userId(1L)
                .amount(new BigDecimal("450.00"))
                .paymentMethod(PaymentMethod.COD)
                .build();

        when(paymentRepository.existsByOrderId(101L)).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setPaymentId(1L);
            p.setCreatedAt(LocalDateTime.now());
            return p;
        });

        CreatePaymentResponse response = paymentService.createPayment(request);

        assertNotNull(response);
        assertEquals(1L, response.getPaymentId());
        assertEquals(101L, response.getOrderId());
        assertEquals(PaymentStatus.PENDING, response.getPaymentStatus());
        assertTrue(response.getTransactionId().startsWith("TXN"));
        assertEquals("COD payment registered. Pending delivery.", response.getMessage());

        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void testCreatePayment_Online_Simulation_Success() {
        // 350.00 -> last digit 0 -> SUCCESS
        PaymentRequest request = PaymentRequest.builder()
                .orderId(102L)
                .userId(1L)
                .amount(new BigDecimal("350.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .build();

        when(paymentRepository.existsByOrderId(102L)).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setPaymentId(2L);
            p.setCreatedAt(LocalDateTime.now());
            return p;
        });

        CreatePaymentResponse response = paymentService.createPayment(request);

        assertNotNull(response);
        assertEquals(2L, response.getPaymentId());
        assertEquals(PaymentStatus.SUCCESS, response.getPaymentStatus());
        assertEquals("Payment processed successfully", response.getMessage());
        assertTrue(response.getTransactionId().startsWith("TXN"));
    }

    @Test
    void testCreatePayment_Online_Simulation_Failed() {
        // 358.00 -> last digit 8 -> FAILED
        PaymentRequest request = PaymentRequest.builder()
                .orderId(103L)
                .userId(2L)
                .amount(new BigDecimal("358.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .build();

        when(paymentRepository.existsByOrderId(103L)).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setPaymentId(3L);
            p.setCreatedAt(LocalDateTime.now());
            return p;
        });

        CreatePaymentResponse response = paymentService.createPayment(request);

        assertNotNull(response);
        assertEquals(3L, response.getPaymentId());
        assertEquals(PaymentStatus.FAILED, response.getPaymentStatus());
        assertEquals("Payment failed (simulated failure)", response.getMessage());
    }

    @Test
    void testCreatePayment_Online_WithRazorpayPaymentId() {
        PaymentRequest request = PaymentRequest.builder()
                .orderId(104L)
                .userId(3L)
                .amount(new BigDecimal("999.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .razorpayPaymentId("pay_RZP123456789")
                .build();

        when(paymentRepository.existsByOrderId(104L)).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setPaymentId(4L);
            p.setCreatedAt(LocalDateTime.now());
            return p;
        });

        CreatePaymentResponse response = paymentService.createPayment(request);

        assertNotNull(response);
        assertEquals(4L, response.getPaymentId());
        assertEquals(PaymentStatus.SUCCESS, response.getPaymentStatus());
        assertEquals("pay_RZP123456789", response.getTransactionId());
        assertEquals("Payment processed successfully via Razorpay", response.getMessage());
    }

    @Test
    void testCreatePayment_DuplicateOrderId_ThrowsPaymentAlreadyExistsException() {
        PaymentRequest request = PaymentRequest.builder()
                .orderId(105L)
                .userId(1L)
                .amount(new BigDecimal("100.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .build();

        when(paymentRepository.existsByOrderId(105L)).thenReturn(true);

        PaymentAlreadyExistsException ex = assertThrows(
                PaymentAlreadyExistsException.class, 
                () -> paymentService.createPayment(request));

        assertTrue(ex.getMessage().contains("Payment already exists for order: 105"));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void testGetPaymentById_Success() {
        Payment payment = Payment.builder()
                .paymentId(10L)
                .orderId(200L)
                .userId(5L)
                .amount(new BigDecimal("500.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId("TXN200")
                .gatewayName("PharmaFlow Payment Gateway v1.0")
                .gatewayResponse("Gateway: PharmaFlow Payment Gateway v1.0 | Status: SUCCESS")
                .createdAt(LocalDateTime.now())
                .build();

        when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));

        PaymentResponse response = paymentService.getPaymentById(10L);

        assertNotNull(response);
        assertEquals(10L, response.getPaymentId());
        assertEquals(200L, response.getOrderId());
        assertEquals(PaymentStatus.SUCCESS, response.getPaymentStatus());
    }

    @Test
    void testGetPaymentById_NotFound_ThrowsResourceNotFoundException() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> paymentService.getPaymentById(999L));
    }

    @Test
    void testGetPaymentByOrderId_Success() {
        Payment payment = Payment.builder()
                .paymentId(11L)
                .orderId(201L)
                .userId(6L)
                .amount(new BigDecimal("250.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId("TXN201")
                .build();

        when(paymentRepository.findByOrderId(201L)).thenReturn(Optional.of(payment));

        PaymentResponse response = paymentService.getPaymentByOrderId(201L);

        assertNotNull(response);
        assertEquals(201L, response.getOrderId());
    }

    @Test
    void testGetPaymentByOrderId_NotFound_ThrowsResourceNotFoundException() {
        when(paymentRepository.findByOrderId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> paymentService.getPaymentByOrderId(999L));
    }

    @Test
    void testGetPaymentsByUserId_Success() {
        Payment p1 = Payment.builder().paymentId(1L).userId(50L).orderId(1L).amount(new BigDecimal("100.00"))
                .paymentMethod(PaymentMethod.COD).paymentStatus(PaymentStatus.PENDING).build();
        Payment p2 = Payment.builder().paymentId(2L).userId(50L).orderId(2L).amount(new BigDecimal("200.00"))
                .paymentMethod(PaymentMethod.ONLINE).paymentStatus(PaymentStatus.SUCCESS).build();

        when(paymentRepository.findByUserId(50L)).thenReturn(List.of(p1, p2));

        List<PaymentResponse> list = paymentService.getPaymentsByUserId(50L);

        assertEquals(2, list.size());
    }

    @Test
    void testGetAllPayments_Success() {
        Payment p1 = Payment.builder().paymentId(1L).userId(1L).orderId(1L).amount(new BigDecimal("100.00"))
                .paymentMethod(PaymentMethod.COD).paymentStatus(PaymentStatus.PENDING).build();

        when(paymentRepository.findAll()).thenReturn(List.of(p1));

        List<PaymentResponse> list = paymentService.getAllPayments();

        assertEquals(1, list.size());
    }

    @Test
    void testRefundPayment_Success() {
        Payment payment = Payment.builder()
                .paymentId(20L)
                .orderId(300L)
                .userId(7L)
                .amount(new BigDecimal("300.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId("TXN300")
                .gatewayResponse("Original Response")
                .build();

        when(paymentRepository.findById(20L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.refundPayment(20L);

        assertNotNull(response);
        assertEquals(PaymentStatus.REFUNDED, response.getPaymentStatus());
        assertTrue(response.getGatewayResponse().contains("Refunded on:"));
    }

    @Test
    void testRefundPayment_WhenStatusFailed_ThrowsInvalidPaymentOperationException() {
        Payment payment = Payment.builder()
                .paymentId(21L)
                .paymentStatus(PaymentStatus.FAILED)
                .build();

        when(paymentRepository.findById(21L)).thenReturn(Optional.of(payment));

        InvalidPaymentOperationException ex = assertThrows(
                InvalidPaymentOperationException.class, 
                () -> paymentService.refundPayment(21L));

        assertTrue(ex.getMessage().contains("Only successful payments can be refunded"));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void testRefundPayment_WhenStatusPending_ThrowsInvalidPaymentOperationException() {
        Payment payment = Payment.builder()
                .paymentId(22L)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        when(paymentRepository.findById(22L)).thenReturn(Optional.of(payment));

        assertThrows(InvalidPaymentOperationException.class, () -> paymentService.refundPayment(22L));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void testRefundPayment_WhenStatusAlreadyRefunded_ThrowsInvalidPaymentOperationException() {
        Payment payment = Payment.builder()
                .paymentId(23L)
                .paymentStatus(PaymentStatus.REFUNDED)
                .build();

        when(paymentRepository.findById(23L)).thenReturn(Optional.of(payment));

        assertThrows(InvalidPaymentOperationException.class, () -> paymentService.refundPayment(23L));
        verify(paymentRepository, never()).save(any());
    }
}
