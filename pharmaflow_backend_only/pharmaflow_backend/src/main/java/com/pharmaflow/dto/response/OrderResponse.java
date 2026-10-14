package com.pharmaflow.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.pharmaflow.enums.OrderStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderResponse {

    private Long orderId;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String prescriptionPath;
    private String shippingAddress;

    private List<OrderItemResponse> orderItems;
    private PaymentResponse payment;
}
