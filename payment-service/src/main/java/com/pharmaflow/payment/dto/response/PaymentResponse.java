package com.pharmaflow.payment.dto.response;

import com.pharmaflow.payment.enums.PaymentMethod;
import com.pharmaflow.payment.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long paymentId;
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String transactionId;
    private String gatewayName;
    private String gatewayResponse;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LocalDateTime getPaymentDate() {
        return createdAt;
    }
}
