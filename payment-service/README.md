# Payment Service - PharmaFlow Microservice

## Overview

Payment Service is an independent microservice for the PharmaFlow e-commerce medicine ordering platform. It handles all payment operations including online payments, cash on delivery (COD), and refunds.

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MySQL
- **Build Tool**: Maven
- **Key Dependencies**:
  - Spring Web
  - Spring Data JPA
  - Spring Validation
  - Lombok
  - OpenFeign
  - MySQL Connector

## Architecture

The service follows a clean layered architecture:

```
controller/          - REST API endpoints
service/            - Business logic interfaces
service/impl/       - Service implementations
repository/         - Data access layer
entity/             - JPA entities
dto/request/        - Request DTOs
dto/response/       - Response DTOs
exception/          - Exception handling
config/             - Configuration classes
enums/              - Enum types
```

## Database

**Database Name**: `payment_db`

**Table**: `payments`

| Column | Type | Description |
|--------|------|-------------|
| payment_id | BIGINT | Primary key |
| order_id | BIGINT | Associated order ID |
| user_id | BIGINT | User who made the payment |
| amount | DECIMAL(10,2) | Payment amount |
| payment_method | VARCHAR(20) | ONLINE or COD |
| payment_status | VARCHAR(20) | PENDING, SUCCESS, FAILED, REFUNDED |
| transaction_id | VARCHAR(255) | Unique transaction identifier |
| payment_date | DATETIME | Payment timestamp |
| gateway_response | VARCHAR(1000) | Gateway response message |

## Setup Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

### Steps

1. **Clone or navigate to the project**
```bash
cd payment-service
```

2. **Create MySQL database**
```bash
mysql -u root -p
CREATE DATABASE payment_db;
```

Or run the provided schema:
```bash
mysql -u root -p < database/schema.sql
```

3. **Configure database credentials**

Edit `src/main/resources/application.properties`:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

4. **Build the project**
```bash
mvn clean install
```

5. **Run the application**
```bash
mvn spring-boot:run
```

The service will start on `http://localhost:8081`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments` | Create a new payment |
| GET | `/payments/{paymentId}` | Get payment by ID |
| GET | `/payments/order/{orderId}` | Get payment by order ID |
| GET | `/payments/user/{userId}` | Get user payment history |
| GET | `/payments` | Get all payments |
| PATCH | `/payments/{paymentId}/refund` | Refund a payment |

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed API documentation.

## Fake Payment Gateway

The service includes a **fake payment gateway** suitable for academic projects:

### Features:
- Generates unique transaction IDs (format: `TXN[12-digit-alphanumeric]`)
- Simulates SUCCESS and FAILED payments
- Deterministic behavior based on amount for easy testing
- Stores gateway response

### Testing Different Scenarios:

**Successful Payment** (amounts ending in 0-7 when multiplied by 100):
```json
{
  "orderId": 15,
  "userId": 6,
  "amount": 350.00,
  "paymentMethod": "ONLINE"
}
```

**Failed Payment** (amounts ending in 8-9 when multiplied by 100):
```json
{
  "orderId": 16,
  "userId": 6,
  "amount": 358.00,
  "paymentMethod": "ONLINE"
}
```

**Cash on Delivery**:
```json
{
  "orderId": 17,
  "userId": 6,
  "amount": 450.00,
  "paymentMethod": "COD"
}
```

## Integration with PharmaFlow Backend

This microservice is designed to be called by the main PharmaFlow backend using **OpenFeign**.

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for detailed integration instructions.

### Quick Integration Example:

In your PharmaFlow backend, create a Feign client:

```java
@FeignClient(name = "payment-service", url = "http://localhost:8081")
public interface PaymentServiceClient {
    @PostMapping("/payments")
    PaymentResponse createPayment(@RequestBody PaymentRequest request);
}
```

Then call it from your Order Service:

```java
@Service
@RequiredArgsConstructor
public class OrderServiceImpl {
    private final PaymentServiceClient paymentServiceClient;
    
    public Order createOrder(Order order, String paymentMethod) {
        // Save order
        order.setOrderStatus(OrderStatus.PAYMENT_PENDING);
        Order savedOrder = orderRepository.save(order);
        
        // Process payment
        PaymentRequest request = new PaymentRequest(
            savedOrder.getOrderId(),
            savedOrder.getUserId(),
            savedOrder.getTotalAmount(),
            paymentMethod
        );
        
        PaymentResponse response = paymentServiceClient.createPayment(request);
        
        // Update order status
        if ("SUCCESS".equals(response.getPaymentStatus())) {
            savedOrder.setOrderStatus(OrderStatus.CONFIRMED);
        } else {
            savedOrder.setOrderStatus(OrderStatus.PAYMENT_FAILED);
        }
        
        return orderRepository.save(savedOrder);
    }
}
```

## Exception Handling

The service includes global exception handling with meaningful HTTP status codes:

- **404 Not Found**: Payment not found
- **409 Conflict**: Payment already exists for order
- **400 Bad Request**: Validation errors or refund not allowed
- **500 Internal Server Error**: Unexpected errors

## Logging

The service uses SLF4J with Logback for logging:

- **DEBUG**: SQL queries and detailed flow
- **INFO**: Payment processing events
- **ERROR**: Exceptions and failures

## Best Practices Implemented

- Constructor-based dependency injection
- Lombok for boilerplate reduction
- DTOs instead of exposing entities
- Transaction management
- Bean validation
- Global exception handling
- SOLID principles
- Clean package structure

## Testing

Run tests with:
```bash
mvn test
```

## Project Structure

```
payment-service/
├── src/
│   ├── main/
│   │   ├── java/com/pharmaflow/payment/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   │   └── impl/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   └── response/
│   │   │   ├── exception/
│   │   │   ├── config/
│   │   │   ├── enums/
│   │   │   └── PaymentServiceApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── database/
│   └── schema.sql
├── pom.xml
├── README.md
├── API_DOCUMENTATION.md
└── INTEGRATION_GUIDE.md
```

## Future Enhancements

- Integration with Logging Microservice (.NET)
- Support for additional payment methods
- Payment analytics and reporting
- Webhook support for payment status updates
- Enhanced fraud detection

## Port Configuration

- **Default Port**: 8081
- **PharmaFlow Backend**: 8080 (assumed)

To change the port, update `application.properties`:
```properties
server.port=8082
```

## Support

For issues or questions:
1. Check the logs in console output
2. Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
3. Review [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)

## License

This is an academic project for PharmaFlow platform.
