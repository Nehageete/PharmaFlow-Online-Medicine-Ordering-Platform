# Integration Guide: Connecting PharmaFlow Backend to Payment Microservice

## Overview

This guide explains how to integrate the Payment Microservice with your existing PharmaFlow monolithic backend using **OpenFeign**.

---

## Integration Architecture

```
PharmaFlow Backend (Monolith)
       ↓
   Order Created
       ↓
OpenFeign Client → Payment Microservice (Port 8081)
       ↓
Payment Processed
       ↓
Payment Response → Update Order Status
```

---

## Step 1: Add OpenFeign Dependency to PharmaFlow Backend

Add the following dependency to your PharmaFlow backend's `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
    <version>4.1.0</version>
</dependency>
```

---

## Step 2: Enable Feign Clients

Add `@EnableFeignClients` to your main Spring Boot application class:

```java
package com.pharmaflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class PharmaFlowApplication {
    public static void main(String[] args) {
        SpringApplication.run(PharmaFlowApplication.class, args);
    }
}
```

---

## Step 3: Create DTOs in PharmaFlow Backend

Create DTOs to match the Payment Service API:

### PaymentRequest.java
```java
package com.pharmaflow.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private String paymentMethod; // "ONLINE" or "COD"
}
```

### PaymentResponse.java
```java
package com.pharmaflow.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long paymentId;
    private String transactionId;
    private String paymentStatus; // "SUCCESS", "FAILED", "PENDING"
}
```

---

## Step 4: Create OpenFeign Client Interface

Create a Feign client interface to communicate with the Payment Microservice:
 Here's where to create it in your PharmaFlow backend:

  PharmaFlow-Backend/
  └── src/
      └── main/
          └── java/
              └── com/
                  └── pharmaflow/
                      └── client/          ← Create this package
                          └── PaymentServiceClient.java
 The integration code in the INTEGRATION_GUIDE.md is for modifying your existing PharmaFlow backend to call this
  payment service.

  So to integrate:

  1. Payment Service (what we just created) - runs standalone on port 8081
  2. PharmaFlow Backend (your existing monolith) - needs to add:
    - OpenFeign dependency to its pom.xml
    - @EnableFeignClients to its main application class
    - Create client/PaymentServiceClient.java interface
    - Create DTOs in dto/payment/ package
    - Update OrderService to call the payment client
  The payment-service microservice is now complete and independent.
```java
package com.pharmaflow.client;

import com.pharmaflow.dto.payment.PaymentRequest;
import com.pharmaflow.dto.payment.PaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
    name = "payment-service",
    url = "${payment.service.url:http://localhost:8081}"
)
public interface PaymentServiceClient {

    @PostMapping("/payments")
    PaymentResponse createPayment(@RequestBody PaymentRequest paymentRequest);

    @GetMapping("/payments/{paymentId}")
    PaymentResponse getPaymentById(@PathVariable Long paymentId);

    @GetMapping("/payments/order/{orderId}")
    PaymentResponse getPaymentByOrderId(@PathVariable Long orderId);

    @GetMapping("/payments/user/{userId}")
    List<PaymentResponse> getUserPaymentHistory(@PathVariable Long userId);

    @PatchMapping("/payments/{paymentId}/refund")
    PaymentResponse refundPayment(@PathVariable Long paymentId);
}
```

---

## Step 5: Configure Payment Service URL

Add the following to your PharmaFlow backend's `application.properties`:

```properties
# Payment Service Configuration
payment.service.url=http://localhost:8081
```

For **production**, update this to your actual payment service URL:
```properties
payment.service.url=http://payment-service:8081
```

---

## Step 6: Integrate Payment Service in Order Service

Update your `OrderService` to call the Payment Service after creating an order:

```java
package com.pharmaflow.service.impl;

import com.pharmaflow.client.PaymentServiceClient;
import com.pharmaflow.dto.payment.PaymentRequest;
import com.pharmaflow.dto.payment.PaymentResponse;
import com.pharmaflow.entity.Order;
import com.pharmaflow.enums.OrderStatus;
import com.pharmaflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl {

    private final OrderRepository orderRepository;
    private final PaymentServiceClient paymentServiceClient;

    @Transactional
    public Order createOrder(Order order, String paymentMethod) {
        // Save the order with initial status
        order.setOrderStatus(OrderStatus.PAYMENT_PENDING);
        Order savedOrder = orderRepository.save(order);

        // Create payment request
        PaymentRequest paymentRequest = new PaymentRequest(
            savedOrder.getOrderId(),
            savedOrder.getUserId(),
            savedOrder.getTotalAmount(),
            paymentMethod
        );

        try {
            // Call Payment Microservice
            PaymentResponse paymentResponse = paymentServiceClient.createPayment(paymentRequest);
            
            log.info("Payment response received: {}", paymentResponse);

            // Update order status based on payment result
            if ("SUCCESS".equals(paymentResponse.getPaymentStatus())) {
                savedOrder.setOrderStatus(OrderStatus.CONFIRMED);
                log.info("Order {} confirmed. Payment successful.", savedOrder.getOrderId());
            } else if ("FAILED".equals(paymentResponse.getPaymentStatus())) {
                savedOrder.setOrderStatus(OrderStatus.PAYMENT_FAILED);
                log.warn("Payment failed for order {}", savedOrder.getOrderId());
            } else if ("PENDING".equals(paymentResponse.getPaymentStatus())) {
                savedOrder.setOrderStatus(OrderStatus.CONFIRMED);
                log.info("COD order {} confirmed. Payment pending on delivery.", savedOrder.getOrderId());
            }

            orderRepository.save(savedOrder);
            return savedOrder;

        } catch (Exception e) {
            log.error("Payment service call failed for order {}: {}", savedOrder.getOrderId(), e.getMessage());
            savedOrder.setOrderStatus(OrderStatus.PAYMENT_FAILED);
            orderRepository.save(savedOrder);
            throw new RuntimeException("Payment processing failed", e);
        }
    }
}
```

---

## Step 7: Add Order Status Enums

Ensure your `OrderStatus` enum includes the following values:

```java
package com.pharmaflow.enums;

public enum OrderStatus {
    PAYMENT_PENDING,
    CONFIRMED,
    PAYMENT_FAILED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
```

---

## Step 8: Exception Handling

Add a Feign exception handler in your PharmaFlow backend:

```java
package com.pharmaflow.exception;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class FeignClientExceptionHandler {

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<String> handleFeignException(FeignException e) {
        log.error("Payment service error: {}", e.getMessage());
        
        if (e.status() == 404) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Payment service resource not found");
        } else if (e.status() == 409) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Payment already exists for this order");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Payment service is currently unavailable");
        }
    }
}
```

---

## Step 9: Testing the Integration

### Start Both Services

1. **Start Payment Service:**
```bash
cd payment-service
mvn spring-boot:run
```
Payment Service runs on: `http://localhost:8081`

2. **Start PharmaFlow Backend:**
```bash
cd pharmaflow-backend
mvn spring-boot:run
```
PharmaFlow Backend runs on: `http://localhost:8080`

### Test Order Creation

```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": 6,
    "items": [...],
    "totalAmount": 350.00,
    "paymentMethod": "ONLINE"
  }'
```

Expected flow:
1. Order created with status `PAYMENT_PENDING`
2. Payment Service is called
3. Payment processed and status returned
4. Order status updated to `CONFIRMED` or `PAYMENT_FAILED`

---

## Step 10: Optional - Circuit Breaker (Resilience4j)

For production, add circuit breaker to handle Payment Service downtime:

### Add Dependency:
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
    <version>3.1.0</version>
</dependency>
```

### Configure Circuit Breaker:
```properties
# Circuit Breaker Configuration
resilience4j.circuitbreaker.instances.payment-service.registerHealthIndicator=true
resilience4j.circuitbreaker.instances.payment-service.slidingWindowSize=10
resilience4j.circuitbreaker.instances.payment-service.failureRateThreshold=50
resilience4j.circuitbreaker.instances.payment-service.waitDurationInOpenState=30000
```

---

## Communication Flow Summary

```
1. User places order in PharmaFlow frontend
         ↓
2. PharmaFlow backend creates order (status: PAYMENT_PENDING)
         ↓
3. PharmaFlow calls Payment Service via OpenFeign
         ↓
4. Payment Service processes payment (SUCCESS/FAILED/PENDING)
         ↓
5. Payment Service returns response
         ↓
6. PharmaFlow updates order status (CONFIRMED/PAYMENT_FAILED)
         ↓
7. Response sent to user
```

---

## Future: Logging Microservice Integration

When the Logging Microservice (.NET) is ready, both services can independently call it:

```
PharmaFlow Backend ──┐
                     ├──→ Logging Microservice (.NET)
Payment Service ─────┘
```

This microservice is designed to support this future integration without requiring architectural changes.

---

## Troubleshooting

### Payment Service Not Reachable
- Ensure Payment Service is running on port 8081
- Check `payment.service.url` in `application.properties`
- Verify firewall settings

### Feign Client Errors
- Check request/response DTOs match exactly
- Enable Feign logging:
```properties
logging.level.com.pharmaflow.client.PaymentServiceClient=DEBUG
```

### Database Connection Issues
- Ensure MySQL is running
- Verify `payment_db` database exists
- Check credentials in Payment Service's `application.properties`

---

## Contact

For questions or issues, refer to the Payment Service logs:
```bash
tail -f payment-service/logs/application.log
```
