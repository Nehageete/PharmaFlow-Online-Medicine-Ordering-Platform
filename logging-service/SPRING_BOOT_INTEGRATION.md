# Spring Boot Integration Guide

This guide shows how to integrate the Logging Microservice with your existing PharmaFlow Spring Boot backend.

---

## Architecture

```
PharmaFlow Spring Boot Backend (Port 8080)
              ↓
         HTTP POST
              ↓
  Logging Microservice (.NET) (Port 5000)
              ↓
       SQL Server Database
```

---

## Step 1: Create DTOs in Spring Boot

Create a DTO to match the Logging Service API.

### LogRequest.java
```java
package com.pharmaflow.dto.logging;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogRequest {
    private String level;
    private String serviceName;
    private String action;
    private String username;
    private String userRole;
    private String endpoint;
    private String httpMethod;
    private Integer statusCode;
    private String message;
    private String exception;
    private String ipAddress;
}
```

---

## Step 2: Create Logging Client Service

Create a service to send logs to the Logging Microservice.

### LoggingClient.java
```java
package com.pharmaflow.client;

import com.pharmaflow.dto.logging.LogRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class LoggingClient {

    private final RestTemplate restTemplate;

    @Value("${logging.service.url:http://localhost:5000/api/logs}")
    private String loggingServiceUrl;

    public LoggingClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Async
    public void sendLog(LogRequest logRequest) {
        try {
            restTemplate.postForEntity(loggingServiceUrl, logRequest, Void.class);
            log.debug("Log sent to logging service: {}", logRequest.getAction());
        } catch (Exception e) {
            log.error("Failed to send log to logging service: {}", e.getMessage());
        }
    }

    public void logInfo(String serviceName, String action, String message, String username, String userRole) {
        LogRequest logRequest = new LogRequest();
        logRequest.setLevel("INFO");
        logRequest.setServiceName(serviceName);
        logRequest.setAction(action);
        logRequest.setMessage(message);
        logRequest.setUsername(username);
        logRequest.setUserRole(userRole);
        sendLog(logRequest);
    }

    public void logError(String serviceName, String action, String message, String exception) {
        LogRequest logRequest = new LogRequest();
        logRequest.setLevel("ERROR");
        logRequest.setServiceName(serviceName);
        logRequest.setAction(action);
        logRequest.setMessage(message);
        logRequest.setException(exception);
        sendLog(logRequest);
    }

    public void logWarning(String serviceName, String action, String message) {
        LogRequest logRequest = new LogRequest();
        logRequest.setLevel("WARN");
        logRequest.setServiceName(serviceName);
        logRequest.setAction(action);
        logRequest.setMessage(message);
        sendLog(logRequest);
    }
}
```

---

## Step 3: Configure RestTemplate

Add RestTemplate bean in your configuration class.

### AppConfig.java
```java
package com.pharmaflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableAsync
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

---

## Step 4: Update application.properties

Add the logging service URL.

```properties
# Logging Service Configuration
logging.service.url=http://localhost:5000/api/logs
```

---

## Step 5: Create Logging Interceptor (Optional)

Automatically log all HTTP requests.

### LoggingInterceptor.java
```java
package com.pharmaflow.interceptor;

import com.pharmaflow.client.LoggingClient;
import com.pharmaflow.dto.logging.LogRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class LoggingInterceptor implements HandlerInterceptor {

    private final LoggingClient loggingClient;

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception ex) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "Anonymous";
        String userRole = auth != null && !auth.getAuthorities().isEmpty() 
            ? auth.getAuthorities().iterator().next().getAuthority() 
            : null;

        LogRequest logRequest = new LogRequest();
        logRequest.setLevel(response.getStatus() >= 400 ? "ERROR" : "INFO");
        logRequest.setServiceName("PharmaFlow Backend");
        logRequest.setAction(request.getMethod() + " " + request.getRequestURI());
        logRequest.setUsername(username);
        logRequest.setUserRole(userRole);
        logRequest.setEndpoint(request.getRequestURI());
        logRequest.setHttpMethod(request.getMethod());
        logRequest.setStatusCode(response.getStatus());
        logRequest.setMessage("API Request: " + request.getMethod() + " " + request.getRequestURI());
        logRequest.setIpAddress(request.getRemoteAddr());

        if (ex != null) {
            logRequest.setException(ex.getMessage());
        }

        loggingClient.sendLog(logRequest);
    }
}
```

### Register Interceptor

```java
package com.pharmaflow.config;

import com.pharmaflow.interceptor.LoggingInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final LoggingInterceptor loggingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loggingInterceptor)
                .addPathPatterns("/api/**");
    }
}
```

---

## Step 6: Use Logging in Services

### Example: User Registration

```java
package com.pharmaflow.service.impl;

import com.pharmaflow.client.LoggingClient;
import com.pharmaflow.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl {

    private final LoggingClient loggingClient;

    public User registerUser(User user) {
        try {
            // Registration logic
            User savedUser = userRepository.save(user);

            // Log successful registration
            loggingClient.logInfo(
                "User Service",
                "User Registration",
                "New user registered: " + user.getEmail(),
                user.getEmail(),
                user.getRole().name()
            );

            return savedUser;
        } catch (Exception e) {
            // Log error
            loggingClient.logError(
                "User Service",
                "User Registration Failed",
                "Failed to register user: " + user.getEmail(),
                e.getMessage()
            );
            throw e;
        }
    }
}
```

### Example: Order Placement

```java
package com.pharmaflow.service.impl;

import com.pharmaflow.client.LoggingClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl {

    private final LoggingClient loggingClient;

    public Order placeOrder(Order order) {
        Order savedOrder = orderRepository.save(order);

        loggingClient.logInfo(
            "Order Service",
            "Order Placed",
            String.format("Order #%d placed by user %s for amount %.2f",
                savedOrder.getOrderId(),
                savedOrder.getUser().getEmail(),
                savedOrder.getTotalAmount()),
            savedOrder.getUser().getEmail(),
            savedOrder.getUser().getRole().name()
        );

        return savedOrder;
    }
}
```

### Example: Payment Success/Failure

```java
package com.pharmaflow.service.impl;

import com.pharmaflow.client.LoggingClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl {

    private final LoggingClient loggingClient;

    public void processPayment(Payment payment) {
        if (payment.getStatus().equals("SUCCESS")) {
            loggingClient.logInfo(
                "Payment Service",
                "Payment Success",
                String.format("Payment successful for order #%d, amount: %.2f",
                    payment.getOrderId(), payment.getAmount()),
                payment.getUsername(),
                "CUSTOMER"
            );
        } else {
            loggingClient.logError(
                "Payment Service",
                "Payment Failed",
                String.format("Payment failed for order #%d", payment.getOrderId()),
                payment.getException()
            );
        }
    }
}
```

---

## Step 7: Global Exception Handler

Log all exceptions globally.

```java
package com.pharmaflow.exception;

import com.pharmaflow.client.LoggingClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final LoggingClient loggingClient;

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "Anonymous";

        loggingClient.logError(
            "PharmaFlow Backend",
            "Exception Occurred",
            "Unhandled exception: " + ex.getMessage(),
            ex.getClass().getName() + ": " + ex.getMessage()
        );

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("An error occurred"));
    }
}
```

---

## Common Events to Log

| Event | Level | Service Name | Action | Example Message |
|-------|-------|--------------|--------|-----------------|
| User Login | INFO | Auth Service | User Login | User logged in: user@email.com |
| User Registration | INFO | Auth Service | User Registration | New user registered: user@email.com |
| Medicine Viewed | INFO | Medicine Service | Medicine Viewed | Customer viewed medicine: Paracetamol |
| Medicine Added | INFO | Medicine Service | Medicine Added | Admin added medicine: Aspirin |
| Medicine Updated | INFO | Medicine Service | Medicine Updated | Admin updated medicine: ID 5 |
| Medicine Deleted | WARN | Medicine Service | Medicine Deleted | Admin deleted medicine: ID 10 |
| Cart Updated | INFO | Cart Service | Cart Updated | User added item to cart |
| Wishlist Updated | INFO | Wishlist Service | Wishlist Updated | User added item to wishlist |
| Order Placed | INFO | Order Service | Order Placed | Order #123 placed for $250.00 |
| Payment Success | INFO | Payment Service | Payment Success | Payment successful: Order #123 |
| Payment Failed | ERROR | Payment Service | Payment Failed | Payment failed: Order #124 |
| Prescription Uploaded | INFO | Prescription Service | Prescription Uploaded | User uploaded prescription |
| Stock Updated | INFO | Inventory Service | Stock Updated | Stock updated for medicine ID 5 |
| User Activated | WARN | Admin Service | User Activated | Admin activated user: user@email.com |
| User Deactivated | WARN | Admin Service | User Deactivated | Admin deactivated user: user@email.com |
| Exception | ERROR | Various | Exception Occurred | NullPointerException in OrderService |

---

## Testing the Integration

### 1. Start the Logging Service

```bash
cd logging-service
dotnet run
```

Service runs on `http://localhost:5000`

### 2. Start Spring Boot Backend

```bash
cd pharmaflow-backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

### 3. Perform Actions

- Register a user
- Login
- View medicines
- Add to cart
- Place an order

### 4. Verify Logs

Call the Logging Service API:

```bash
curl http://localhost:5000/api/logs
```

Or view in Swagger: `http://localhost:5000`

---

## Production Considerations

### 1. Error Handling

Ensure logging failures don't break the main application:

```java
@Async
public void sendLog(LogRequest logRequest) {
    try {
        restTemplate.postForEntity(loggingServiceUrl, logRequest, Void.class);
    } catch (Exception e) {
        // Log locally, don't propagate
        log.error("Failed to send log: {}", e.getMessage());
    }
}
```

### 2. Circuit Breaker (Optional)

Use Resilience4j to prevent cascading failures:

```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot2</artifactId>
    <version>2.0.2</version>
</dependency>
```

### 3. Batch Logging (Optional)

For high-volume applications, batch logs before sending.

---

## Troubleshooting

### Logging Service Not Reachable

- Verify Logging Service is running: `curl http://localhost:5000/api/logs`
- Check `logging.service.url` in `application.properties`
- Ensure firewall allows connections

### Logs Not Appearing

- Check Spring Boot console for errors
- Verify LoggingClient is being called
- Check Logging Service logs

### Performance Issues

- Ensure logging is asynchronous (`@Async`)
- Consider batch logging for high traffic
- Add circuit breaker for resilience

---

## Summary

Integration Flow:
1. Spring Boot performs an action
2. LoggingClient creates LogRequest
3. RestTemplate sends POST to Logging Service
4. Logging Service stores log in SQL Server
5. Spring Boot continues normal operation (async)

All logging is asynchronous and will not impact the performance of your main application.
