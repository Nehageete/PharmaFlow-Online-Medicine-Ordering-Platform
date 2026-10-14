package com.pharmaflow.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemResponse {

    private Long orderItemId;
    private Long medicineId;
    private String medicineName;
    private Integer quantity;
    private BigDecimal price;
}
