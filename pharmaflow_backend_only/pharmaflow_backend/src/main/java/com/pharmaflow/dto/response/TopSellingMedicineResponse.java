package com.pharmaflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TopSellingMedicineResponse {

    private Long medicineId;
    private String medicineName;
    private Long totalQuantitySold;
}
