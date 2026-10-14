package com.pharmaflow.dto.request;

import com.pharmaflow.enums.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProcessPaymentRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String transactionId;
}
