package com.pharmaflow.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.pharmaflow.enums.PaymentMethod;
import com.pharmaflow.enums.PaymentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPaymentResponse {

    private Long paymentId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String transactionId;
    private LocalDateTime paymentDate;
    private String gatewayName;

    // extra context that plain PaymentResponse doesn't carry - needed for the admin table
    private Long orderId;
    private String customerName;
    private String customerEmail;
}
