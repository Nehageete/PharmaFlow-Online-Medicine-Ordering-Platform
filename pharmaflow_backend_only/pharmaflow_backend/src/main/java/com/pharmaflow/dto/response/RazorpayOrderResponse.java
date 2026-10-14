package com.pharmaflow.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponse {
    private String razorpayOrderId;
    private BigDecimal amount;
    private Integer amountInPaise;
    private String currency;
    private String keyId;
    private Long orderId;
}
