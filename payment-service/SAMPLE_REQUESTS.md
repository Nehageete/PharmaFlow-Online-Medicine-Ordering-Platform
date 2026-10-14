# Sample API Requests and Responses

This document provides ready-to-use sample requests for testing the Payment Service.

---

## 1. Create Payment - Online (SUCCESS)

### Request
```http
POST http://localhost:8081/payments
Content-Type: application/json

{
  "orderId": 15,
  "userId": 6,
  "amount": 350.00,
  "paymentMethod": "ONLINE"
}
```

### Response
```json
{
  "paymentId": 1,
  "transactionId": "TXN7A8B9C0D1E2F",
  "paymentStatus": "SUCCESS"
}
```

### cURL
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

---

## 2. Create Payment - Online (FAILED)

### Request
```http
POST http://localhost:8081/payments
Content-Type: application/json

{
  "orderId": 16,
  "userId": 6,
  "amount": 358.00,
  "paymentMethod": "ONLINE"
}
```

### Response
```json
{
  "paymentId": 2,
  "transactionId": "TXN8F9E0D1C2B3A",
  "paymentStatus": "FAILED"
}
```

### cURL
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

---

## 3. Create Payment - COD

### Request
```http
POST http://localhost:8081/payments
Content-Type: application/json

{
  "orderId": 17,
  "userId": 6,
  "amount": 450.00,
  "paymentMethod": "COD"
}
```

### Response
```json
{
  "paymentId": 3,
  "transactionId": "TXN1A2B3C4D5E6F",
  "paymentStatus": "PENDING"
}
```

### cURL
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

---

## 4. Get Payment by ID

### Request
```http
GET http://localhost:8081/payments/1
```

### Response
```json
{
  "paymentId": 1,
  "orderId": 15,
  "userId": 6,
  "amount": 350.00,
  "paymentMethod": "ONLINE",
  "paymentStatus": "SUCCESS",
  "transactionId": "TXN7A8B9C0D1E2F",
  "paymentDate": "2024-01-15T10:30:00",
  "gatewayResponse": "Gateway: PharmaFlow Payment Gateway v1.0 | Transaction ID: TXN7A8B9C0D1E2F | Status: SUCCESS | Timestamp: 2024-01-15T10:30:00"
}
```

### cURL
```bash
curl -X GET http://localhost:8081/payments/1
```

---

## 5. Get Payment by Order ID

### Request
```http
GET http://localhost:8081/payments/order/15
```

### Response
```json
{
  "paymentId": 1,
  "orderId": 15,
  "userId": 6,
  "amount": 350.00,
  "paymentMethod": "ONLINE",
  "paymentStatus": "SUCCESS",
  "transactionId": "TXN7A8B9C0D1E2F",
  "paymentDate": "2024-01-15T10:30:00",
  "gatewayResponse": "Gateway: PharmaFlow Payment Gateway v1.0 | Transaction ID: TXN7A8B9C0D1E2F | Status: SUCCESS | Timestamp: 2024-01-15T10:30:00"
}
```

### cURL
```bash
curl -X GET http://localhost:8081/payments/order/15
```

---

## 6. Get User Payment History

### Request
```http
GET http://localhost:8081/payments/user/6
```

### Response
```json
[
  {
    "paymentId": 1,
    "orderId": 15,
    "userId": 6,
    "amount": 350.00,
    "paymentMethod": "ONLINE",
    "paymentStatus": "SUCCESS",
    "transactionId": "TXN7A8B9C0D1E2F",
    "paymentDate": "2024-01-15T10:30:00",
    "gatewayResponse": "Gateway: PharmaFlow Payment Gateway v1.0 | Transaction ID: TXN7A8B9C0D1E2F | Status: SUCCESS | Timestamp: 2024-01-15T10:30:00"
  },
  {
    "paymentId": 3,
    "orderId": 17,
    "userId": 6,
    "amount": 450.00,
    "paymentMethod": "COD",
    "paymentStatus": "PENDING",
    "transactionId": "TXN1A2B3C4D5E6F",
    "paymentDate": "2024-01-16T11:00:00",
    "gatewayResponse": "COD - Payment will be collected on delivery"
  }
]
```

### cURL
```bash
curl -X GET http://localhost:8081/payments/user/6
```

---

## 7. Get All Payments

### Request
```http
GET http://localhost:8081/payments
```

### cURL
```bash
curl -X GET http://localhost:8081/payments
```

---

## 8. Refund Payment

### Request
```http
PATCH http://localhost:8081/payments/1/refund
```

### Response
```json
{
  "paymentId": 1,
  "orderId": 15,
  "userId": 6,
  "amount": 350.00,
  "paymentMethod": "ONLINE",
  "paymentStatus": "REFUNDED",
  "transactionId": "TXN7A8B9C0D1E2F",
  "paymentDate": "2024-01-15T10:30:00",
  "gatewayResponse": "Gateway: PharmaFlow Payment Gateway v1.0 | Transaction ID: TXN7A8B9C0D1E2F | Status: SUCCESS | Timestamp: 2024-01-15T10:30:00 | Refunded on: 2024-01-16T14:00:00"
}
```

### cURL
```bash
curl -X PATCH http://localhost:8081/payments/1/refund
```

---

## Error Response Examples

### 1. Payment Not Found (404)

**Request:**
```http
GET http://localhost:8081/payments/999
```

**Response:**
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

### 2. Payment Already Exists (409)

**Request:**
```http
POST http://localhost:8081/payments
Content-Type: application/json

{
  "orderId": 15,
  "userId": 6,
  "amount": 350.00,
  "paymentMethod": "ONLINE"
}
```

**Response:**
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

### 3. Validation Error (400)

**Request:**
```http
POST http://localhost:8081/payments
Content-Type: application/json

{
  "orderId": 15,
  "userId": 6,
  "amount": -50.00,
  "paymentMethod": "ONLINE"
}
```

**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Input validation failed",
  "errors": {
    "amount": "Amount must be greater than zero"
  },
  "path": "/payments"
}
```

---

## Testing Payment Gateway Behavior

The fake payment gateway uses a deterministic algorithm based on the amount:

### Formula
```
lastDigit = (amount * 100) % 10
if lastDigit >= 0 and lastDigit <= 7:
    status = SUCCESS
else:
    status = FAILED
```

### Examples

| Amount | Last Digit | Status |
|--------|------------|--------|
| 350.00 | 0 | SUCCESS |
| 351.00 | 1 | SUCCESS |
| 357.00 | 7 | SUCCESS |
| 358.00 | 8 | FAILED |
| 359.00 | 9 | FAILED |
| 360.00 | 0 | SUCCESS |

### Test Cases

**SUCCESS Amounts:** 350.00, 351.00, 352.00, 353.00, 354.00, 355.00, 356.00, 357.00, 360.00

**FAILED Amounts:** 358.00, 359.00, 368.00, 369.00, 378.00, 379.00
