package com.pharmaflow.service.impl;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmaflow.dto.response.MedicineResponse;
import com.pharmaflow.dto.response.ReportsSummaryResponse;
import com.pharmaflow.dto.response.TopSellingMedicineResponse;
import com.pharmaflow.entities.Medicine;
import com.pharmaflow.repository.MedicineRepository;
import com.pharmaflow.repository.OrderItemRepository;
import com.pharmaflow.repository.OrderRepository;
import com.pharmaflow.service.ReportsService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReportsServiceImpl implements ReportsService {

    // medicines at or below this stock level are flagged as "low stock" for the admin dashboard
    private static final int LOW_STOCK_THRESHOLD = 10;
    private static final int TOP_SELLING_LIMIT = 5;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MedicineRepository medicineRepository;

    @Override
    public ReportsSummaryResponse getSummary() {
        ReportsSummaryResponse response = new ReportsSummaryResponse();

        response.setTotalRevenue(orderRepository.sumRevenueExcludingCancelled());

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (Object[] row : orderRepository.countOrdersGroupedByStatus()) {
            ordersByStatus.put(row[0].toString(), (Long) row[1]);
        }
        response.setOrdersByStatus(ordersByStatus);

        response.setLowStockMedicines(medicineRepository.findByStockLessThan(LOW_STOCK_THRESHOLD + 1).stream()
                .map(this::toMedicineResponse)
                .toList());

        response.setTopSellingMedicines(orderItemRepository
                .findTopSellingMedicines(PageRequest.of(0, TOP_SELLING_LIMIT)).stream()
                .map(row -> new TopSellingMedicineResponse((Long) row[0], (String) row[1], (Long) row[2]))
                .toList());

        return response;
    }

    private MedicineResponse toMedicineResponse(Medicine medicine) {
        MedicineResponse response = new MedicineResponse();
        response.setMedicineId(medicine.getMedicineId());
        response.setName(medicine.getName());
        response.setBrand(medicine.getBrand());
        response.setManufacturer(medicine.getManufacturer());
        response.setDescription(medicine.getDescription());
        response.setPrice(medicine.getPrice());
        response.setStock(medicine.getStock());
        response.setUnit(medicine.getUnit());
        response.setExpiryDate(medicine.getExpiryDate());
        response.setImage(medicine.getImage());
        response.setPrescriptionRequired(medicine.isPrescriptionRequired());
        response.setCreatedAt(medicine.getCreatedAt());
        response.setUpdatedAt(medicine.getUpdatedAt());
        if (medicine.getCategory() != null) {
            response.setCategoryId(medicine.getCategory().getCategoryId());
            response.setCategoryName(medicine.getCategory().getCategoryName());
        }
        return response;
    }
}
