package com.pharmaflow.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.pharmaflow.entities.Order;
import com.pharmaflow.enums.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // used for the customer's "My Orders" / order history screen
    List<Order> findByUser_UserId(Long userId);

    // used by Pharmacist's queue - e.g. all PLACED orders waiting for prescription review
    List<Order> findByStatus(OrderStatus status);

    // used for "track order" - a customer can only see their own order, so we scope by user as well as order id
    Optional<Order> findByOrderIdAndUser_UserId(Long orderId, Long userId);

    // used by Admin Reports - total revenue excludes CANCELLED orders (never fulfilled/paid for)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> com.pharmaflow.enums.OrderStatus.CANCELLED")
    BigDecimal sumRevenueExcludingCancelled();

    // used by Admin Reports - order counts grouped by status, e.g. for a status breakdown chart
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersGroupedByStatus();
}
