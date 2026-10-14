# Payment Service API Documentation

## Base URL
```
http://localhost:8081
```

## Endpoints

### 1. Create Payment
**POST** `/payments`

Creates a new payment for an order.

**Request Body:**
```json
{
  "orderId": 15,
  "userId": 6,
  "amount": 350.00,
  "paymentMethod": "ONLINE"
}
```

**Response (201 Created):**
```json
{
  "paymentId": 1,
  "transactionId": "TXN123456789",
  "paymentStatus": "SUCCESS"
}
```

**Validation Rules:**
- `orderId`: Required, must be a valid Long
- `userId`: Required, must be a valid Long
- `amount`: Required, must be greater than 0.01
- `paymentMethod`: Required, must be either "ONLINE" or "COD"

**Error Response (409 Conflict):**
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Payment already exists for order: 15",
  "path": "/payments"
}
```

---

### 2. Get Payment by ID
**GET** `/payments/{paymentId}`

Retrieves payment details by payment ID.

**Response (200 OK):**
```json
{
  "paymentId": 1,
  "orderId": 15,
  "userId": 6,
  "amount": 350.00,
  "paymentMethod": "ONLINE",
  "paymentStatus": "SUCCESS",
  "transactionId": "TXN123456789",
  "paymentDate": "2024-01-15T10:30:00",
  "gatewayResponse": "Gateway: PharmaFlow Payment Gateway v1.0 | Transaction ID: TXN123456789 | Status: SUCCESS | Timestamp: 2024-01-15T10:30:00"
}
```

**Error Response (404 Not Found):**
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Payment not found with ID: 999",
  "path": "/payments/999"
}
```

---

### 3. Get Payment by Order ID
**GET** `/payments/order/{orderId}`

Retrieves payment details for a specific order.

**Response (200 OK):**
```json
{
  "paymentId": 1,
  "orderId": 15,
  "userId": 6,
  "amount": 350.00,
  "paymentMethod": "ONLINE",
  "paymentStatus": "SUCCESS",
  "transactionId": "TXN123456789",
  "paymentDate": "2024-01-15T10:30:00",
  "gatewayResponse": "Gateway: PharmaFlow Payment Gateway v1.0 | Transaction ID: TXN123456789 | Status: SUCCESS | Timestamp: 2024-01-15T10:30:00"
}
```

---

### 4. Get Payment History by User ID
**GET** `/payments/user/{userId}`

Retrieves complete payment history for a user.

**Response (200 OK):**
```json
[
  {
    "paymentId": 1,
    "orderId": 15,
    "userId": 6,
    "amount": 350.00,
    "paymentMethod": "ONLINE",
    "paymentStatus": "SUCCESS",
    "transactionId": "TXN123456789",
    "paymentDate": "2024-01-15T10:30:00",
    "gatewayResponse": "Gateway: PharmaFlow Payment Gateway v1.0 | Transaction ID: TXN123456789 | Status: SUCCESS | Timestamp: 2024-01-15T10:30:00"
  },
  {
    "paymentId": 2,
    "orderId": 16,
    "userId": 6,
    "amount": 450.00,
    "paymentMethod": "COD",
    "paymentStatus": "PENDING",
    "transactionId": "TXN987654321",
    "paymentDate": "2024-01-16T11:00:00",
    "gatewayResponse": "COD - Payment will be collected on delivery"
  }
]
```

---

### 5. Get All Payments
**GET** `/payments`

Retrieves all payments in the system.

**Response (200 OK):**
```json
[
  {
    "paymentId": 1,
    "orderId": 15,
    "userId": 6,
    "amount": 350.00,
    "paymentMethod": "ONLINE",
    "paymentStatus": "SUCCESS",
    "transactionId": "TXN123456789",
    "paymentDate": "2024-01-15T10:30:00",
    "gatewayResponse": "Gateway: PharmaFlow Payment Gateway v1.0 | Transaction ID: TXN123456789 | Status: SUCCESS | Timestamp: 2024-01-15T10:30:00"
  }
]
```

---

### 6. Refund Payment
**PATCH** `/payments/{paymentId}/refund`

Refunds an existing successful payment.

**Response (200 OK):**
```json
{
  "paymentId": 1,
  "orderId": 15,
  "userId": 6,
  "amount": 350.00,
  "paymentMethod": "ONLINE",
  "paymentStatus": "REFUNDED",
  "transactionId": "TXN123456789",
  "paymentDate": "2024-01-15T10:30:00",
  "gatewayResponse": "Gateway: PharmaFlow Payment Gateway v1.0 | Transaction ID: TXN123456789 | Status: SUCCESS | Timestamp: 2024-01-15T10:30:00 | Refunded on: 2024-01-16T14:00:00"
}
```

**Error Response (400 Bad Request):**
```json
{
  "timestamp": "2024-01-16T14:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Only successful payments can be refunded. Current status: FAILED",
  "path": "/payments/1/refund"
}
```

---

## Payment Enums

### PaymentMethod
- `ONLINE`: Online payment via payment gateway
- `COD`: Cash on Delivery

### PaymentStatus
- `PENDING`: Payment is pending (used for COD)
- `SUCCESS`: Payment completed successfully
- `FAILED`: Payment failed
- `REFUNDED`: Payment has been refunded

---

## Fake Payment Gateway Behavior

The fake payment gateway simulates real-world payment processing:

1. **Transaction ID Generation**: Generates unique transaction IDs in format `TXN[12-digit-alphanumeric]`

2. **Success/Failure Simulation**: 
   - Uses the last digit of `(amount * 100) % 10`
   - If last digit is 0-7: Payment **SUCCESS**
   - If last digit is 8-9: Payment **FAILED**
   - This allows predictable testing of both scenarios

3. **Examples**:
   - Amount `350.00` → Last digit = `0` → SUCCESS
   - Amount `358.00` → Last digit = `8` → FAILED
   - Amount `359.00` → Last digit = `9` → FAILED

4. **COD Handling**: COD payments are marked as `PENDING` and require no gateway processing

---

## Testing with cURL

### Create Online Payment (SUCCESS)
```bash
curl -X POST http://localhost:8081/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 15,
    "userId": 6,
    "amount": 350.00,
    "paymentMethod": "ONLINE"
  }'
```

### Create Online Payment (FAILED)
```bash
curl -X POST http://localhost:8081/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 16,
    "userId": 6,
    "amount": 358.00,
    "paymentMethod": "ONLINE"
  }'
```

### Create COD Payment
```bash
curl -X POST http://localhost:8081/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 17,
    "userId": 6,
    "amount": 450.00,
    "paymentMethod": "COD"
  }'
```

### Get Payment by ID
```bash
curl -X GET http://localhost:8081/payments/1
```

### Get Payment by Order ID
```bash
curl -X GET http://localhost:8081/payments/order/15
```

### Get User Payment History
```bash
curl -X GET http://localhost:8081/payments/user/6
```

### Refund Payment
```bash
curl -X PATCH http://localhost:8081/payments/1/refund
```
