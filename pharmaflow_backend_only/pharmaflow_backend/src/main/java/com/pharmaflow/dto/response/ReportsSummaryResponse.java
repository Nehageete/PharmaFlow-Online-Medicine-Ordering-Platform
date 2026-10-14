package com.pharmaflow.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportsSummaryResponse {

    private BigDecimal totalRevenue;
    private Map<String, Long> ordersByStatus;
    private List<MedicineResponse> lowStockMedicines;
    private List<TopSellingMedicineResponse> topSellingMedicines;
}
