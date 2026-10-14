package com.pharmaflow.payment.dto.response;

import com.pharmaflow.payment.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentResponse {
    private Long paymentId;
    private Long orderId;
    private String transactionId;
    private PaymentStatus paymentStatus;
    private String message;
}
