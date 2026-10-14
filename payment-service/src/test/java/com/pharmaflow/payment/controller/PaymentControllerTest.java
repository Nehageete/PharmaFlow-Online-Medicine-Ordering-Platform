package com.pharmaflow.payment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmaflow.payment.dto.request.PaymentRequest;
import com.pharmaflow.payment.dto.response.CreatePaymentResponse;
import com.pharmaflow.payment.dto.response.PaymentResponse;
import com.pharmaflow.payment.enums.PaymentMethod;
import com.pharmaflow.payment.enums.PaymentStatus;
import com.pharmaflow.payment.exception.GlobalExceptionHandler;
import com.pharmaflow.payment.exception.InvalidPaymentOperationException;
import com.pharmaflow.payment.exception.PaymentAlreadyExistsException;
import com.pharmaflow.payment.exception.ResourceNotFoundException;
import com.pharmaflow.payment.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
@Import(GlobalExceptionHandler.class)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PaymentService paymentService;

    @Test
    void testCreatePayment_Returns201Created() throws Exception {
        PaymentRequest request = PaymentRequest.builder()
                .orderId(15L)
                .userId(6L)
                .amount(new BigDecimal("350.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .build();

        CreatePaymentResponse response = CreatePaymentResponse.builder()
                .paymentId(1L)
                .orderId(15L)
                .transactionId("TXN123456789ABC")
                .paymentStatus(PaymentStatus.SUCCESS)
                .message("Payment processed successfully")
                .build();

        when(paymentService.createPayment(any(PaymentRequest.class))).thenReturn(response);

        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentId").value(1))
                .andExpect(jsonPath("$.orderId").value(15))
                .andExpect(jsonPath("$.transactionId").value("TXN123456789ABC"))
                .andExpect(jsonPath("$.paymentStatus").value("SUCCESS"));
    }

    @Test
    void testCreatePayment_WhenDuplicate_Returns409Conflict() throws Exception {
        PaymentRequest request = PaymentRequest.builder()
                .orderId(15L)
                .userId(6L)
                .amount(new BigDecimal("350.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .build();

        when(paymentService.createPayment(any(PaymentRequest.class)))
                .thenThrow(new PaymentAlreadyExistsException("Payment already exists for order: 15"));

        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Payment already exists for order: 15"));
    }

    @Test
    void testCreatePayment_InvalidPayload_Returns400BadRequest() throws Exception {
        PaymentRequest request = PaymentRequest.builder()
                .orderId(null) // invalid null
                .userId(6L)
                .amount(new BigDecimal("-10.00")) // invalid negative amount
                .paymentMethod(null)
                .build();

        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    void testGetPaymentById_Success_Returns200() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .orderId(15L)
                .userId(6L)
                .amount(new BigDecimal("350.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId("TXN123")
                .createdAt(LocalDateTime.now())
                .build();

        when(paymentService.getPaymentById(1L)).thenReturn(response);

        mockMvc.perform(get("/payments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value(1))
                .andExpect(jsonPath("$.orderId").value(15))
                .andExpect(jsonPath("$.paymentStatus").value("SUCCESS"));
    }

    @Test
    void testGetPaymentById_NotFound_Returns404() throws Exception {
        when(paymentService.getPaymentById(999L))
                .thenThrow(new ResourceNotFoundException("Payment not found with ID: 999"));

        mockMvc.perform(get("/payments/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Payment not found with ID: 999"));
    }

    @Test
    void testGetPaymentByOrderId_Success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .orderId(15L)
                .userId(6L)
                .amount(new BigDecimal("350.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .paymentStatus(PaymentStatus.SUCCESS)
                .build();

        when(paymentService.getPaymentByOrderId(15L)).thenReturn(response);

        mockMvc.perform(get("/payments/order/15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(15));
    }

    @Test
    void testGetPaymentsByUserId_Success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .orderId(15L)
                .userId(6L)
                .amount(new BigDecimal("350.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .paymentStatus(PaymentStatus.SUCCESS)
                .build();

        when(paymentService.getPaymentsByUserId(6L)).thenReturn(List.of(response));

        mockMvc.perform(get("/payments/user/6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(6));
    }

    @Test
    void testGetAllPayments_Success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .orderId(15L)
                .userId(6L)
                .amount(new BigDecimal("350.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .paymentStatus(PaymentStatus.SUCCESS)
                .build();

        when(paymentService.getAllPayments()).thenReturn(List.of(response));

        mockMvc.perform(get("/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].paymentId").value(1));
    }

    @Test
    void testRefundPayment_Success_Returns200() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .orderId(15L)
                .userId(6L)
                .amount(new BigDecimal("350.00"))
                .paymentMethod(PaymentMethod.ONLINE)
                .paymentStatus(PaymentStatus.REFUNDED)
                .transactionId("TXN123")
                .build();

        when(paymentService.refundPayment(1L)).thenReturn(response);

        mockMvc.perform(patch("/payments/1/refund"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value(1))
                .andExpect(jsonPath("$.paymentStatus").value("REFUNDED"));
    }

    @Test
    void testRefundPayment_WhenInvalidStatus_Returns400BadRequest() throws Exception {
        when(paymentService.refundPayment(1L))
                .thenThrow(new InvalidPaymentOperationException("Only successful payments can be refunded. Current status: FAILED"));

        mockMvc.perform(patch("/payments/1/refund"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Only successful payments can be refunded. Current status: FAILED"));
    }
}
