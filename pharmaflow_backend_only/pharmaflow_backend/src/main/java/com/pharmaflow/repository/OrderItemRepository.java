package com.pharmaflow.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.pharmaflow.entities.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // used to fetch all line items belonging to one order (order detail / invoice screen)
    List<OrderItem> findByOrder_OrderId(Long orderId);

    // used by Admin Reports - best-selling medicines by total quantity ordered across all orders.
    // Each row: [medicineId, medicineName, totalQuantitySold]. Pageable caps it to a top-N list.
    @Query("SELECT oi.medicine.medicineId, oi.medicine.name, SUM(oi.quantity) "
            + "FROM OrderItem oi GROUP BY oi.medicine.medicineId, oi.medicine.name ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingMedicines(Pageable pageable);
}
