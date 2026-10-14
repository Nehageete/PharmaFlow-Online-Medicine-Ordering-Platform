# Sample API Requests and Responses

This document provides ready-to-use sample requests for testing the Logging Service API.

---

## Base URL

```
http://localhost:5000/api/logs
```

---

## 1. Create Log - User Login (INFO)

### Request
```http
POST http://localhost:5000/api/logs
Content-Type: application/json

{
  "level": "INFO",
  "serviceName": "Auth Service",
  "action": "User Login",
  "username": "tanvi123@gmail.com",
  "userRole": "CUSTOMER",
  "endpoint": "/api/auth/login",
  "httpMethod": "POST",
  "statusCode": 200,
  "message": "User logged in successfully",
  "exception": "",
  "ipAddress": "127.0.0.1"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Log stored successfully",
  "data": {
    "logId": 1,
    "timestamp": "2026-08-02T10:30:00Z",
    "level": "INFO",
    "serviceName": "Auth Service",
    "action": "User Login",
    "username": "tanvi123@gmail.com",
    "userRole": "CUSTOMER",
    "endpoint": "/api/auth/login",
    "httpMethod": "POST",
    "statusCode": 200,
    "message": "User logged in successfully",
    "exception": null,
    "ipAddress": "127.0.0.1"
  }
}
```

### cURL
```bash
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "INFO",
    "serviceName": "Auth Service",
    "action": "User Login",
    "username": "tanvi123@gmail.com",
    "userRole": "CUSTOMER",
    "endpoint": "/api/auth/login",
    "httpMethod": "POST",
    "statusCode": 200,
    "message": "User logged in successfully",
    "ipAddress": "127.0.0.1"
  }'
```

---

## 2. Create Log - Medicine Viewed (INFO)

### Request
```http
POST http://localhost:5000/api/logs
Content-Type: application/json

{
  "level": "INFO",
  "serviceName": "Medicine Service",
  "action": "Medicine Viewed",
  "username": "tanvi123@gmail.com",
  "userRole": "CUSTOMER",
  "endpoint": "/api/medicines/5",
  "httpMethod": "GET",
  "statusCode": 200,
  "message": "Customer viewed medicine: Paracetamol 500mg",
  "ipAddress": "192.168.1.100"
}
```

### cURL
```bash
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "INFO",
    "serviceName": "Medicine Service",
    "action": "Medicine Viewed",
    "username": "tanvi123@gmail.com",
    "userRole": "CUSTOMER",
    "endpoint": "/api/medicines/5",
    "httpMethod": "GET",
    "statusCode": 200,
    "message": "Customer viewed medicine: Paracetamol 500mg",
    "ipAddress": "192.168.1.100"
  }'
```

---

## 3. Create Log - Order Placed (INFO)

### Request
```http
POST http://localhost:5000/api/logs
Content-Type: application/json

{
  "level": "INFO",
  "serviceName": "Order Service",
  "action": "Order Placed",
  "username": "john.doe@gmail.com",
  "userRole": "CUSTOMER",
  "endpoint": "/api/orders",
  "httpMethod": "POST",
  "statusCode": 201,
  "message": "Order #123 placed successfully for amount $350.00",
  "ipAddress": "192.168.1.50"
}
```

---

## 4. Create Log - Payment Failed (ERROR)

### Request
```http
POST http://localhost:5000/api/logs
Content-Type: application/json

{
  "level": "ERROR",
  "serviceName": "Payment Service",
  "action": "Payment Failed",
  "username": "alice@gmail.com",
  "userRole": "CUSTOMER",
  "endpoint": "/api/payments",
  "httpMethod": "POST",
  "statusCode": 500,
  "message": "Payment processing failed for order #124",
  "exception": "java.net.SocketTimeoutException: Payment gateway timeout after 30 seconds",
  "ipAddress": "192.168.1.75"
}
```

### cURL
```bash
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "ERROR",
    "serviceName": "Payment Service",
    "action": "Payment Failed",
    "username": "alice@gmail.com",
    "userRole": "CUSTOMER",
    "endpoint": "/api/payments",
    "httpMethod": "POST",
    "statusCode": 500,
    "message": "Payment processing failed for order #124",
    "exception": "java.net.SocketTimeoutException: Payment gateway timeout",
    "ipAddress": "192.168.1.75"
  }'
```

---

## 5. Create Log - Admin Action (WARN)

### Request
```http
POST http://localhost:5000/api/logs
Content-Type: application/json

{
  "level": "WARN",
  "serviceName": "Admin Service",
  "action": "User Deactivated",
  "username": "admin@pharmaflow.com",
  "userRole": "ADMIN",
  "endpoint": "/api/admin/users/10/deactivate",
  "httpMethod": "PATCH",
  "statusCode": 200,
  "message": "Admin deactivated user account: john.doe@gmail.com",
  "ipAddress": "127.0.0.1"
}
```

---

## 6. Create Log - Exception Occurred (ERROR)

### Request
```http
POST http://localhost:5000/api/logs
Content-Type: application/json

{
  "level": "ERROR",
  "serviceName": "Cart Service",
  "action": "Exception Occurred",
  "username": "user@gmail.com",
  "userRole": "CUSTOMER",
  "endpoint": "/api/cart/add",
  "httpMethod": "POST",
  "statusCode": 500,
  "message": "Failed to add item to cart",
  "exception": "java.lang.NullPointerException: Medicine object is null at com.pharmaflow.service.CartServiceImpl.addToCart(CartServiceImpl.java:45)",
  "ipAddress": "192.168.1.200"
}
```

---

## 7. Get All Logs

### Request
```http
GET http://localhost:5000/api/logs
```

### Response
```json
{
  "success": true,
  "message": "Logs retrieved successfully",
  "data": [
    {
      "logId": 3,
      "timestamp": "2026-08-02T12:00:00Z",
      "level": "ERROR",
      "serviceName": "Payment Service",
      "action": "Payment Failed",
      "username": "alice@gmail.com",
      "userRole": "CUSTOMER",
      "endpoint": "/api/payments",
      "httpMethod": "POST",
      "statusCode": 500,
      "message": "Payment processing failed",
      "exception": "Timeout",
      "ipAddress": "192.168.1.75"
    },
    {
      "logId": 2,
      "timestamp": "2026-08-02T11:30:00Z",
      "level": "INFO",
      "serviceName": "Medicine Service",
      "action": "Medicine Viewed",
      "username": "tanvi123@gmail.com",
      "userRole": "CUSTOMER",
      "endpoint": "/api/medicines/5",
      "httpMethod": "GET",
      "statusCode": 200,
      "message": "Customer viewed medicine",
      "exception": null,
      "ipAddress": "192.168.1.100"
    }
  ]
}
```

### cURL
```bash
curl http://localhost:5000/api/logs
```

---

## 8. Get Log by ID

### Request
```http
GET http://localhost:5000/api/logs/1
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Log retrieved successfully",
  "data": {
    "logId": 1,
    "timestamp": "2026-08-02T10:30:00Z",
    "level": "INFO",
    "serviceName": "Auth Service",
    "action": "User Login",
    "username": "tanvi123@gmail.com",
    "userRole": "CUSTOMER",
    "endpoint": "/api/auth/login",
    "httpMethod": "POST",
    "statusCode": 200,
    "message": "User logged in successfully",
    "exception": null,
    "ipAddress": "127.0.0.1"
  }
}
```

### cURL
```bash
curl http://localhost:5000/api/logs/1
```

---

## 9. Get Logs by Level

### Request
```http
GET http://localhost:5000/api/logs/level/ERROR
```

### Response
```json
{
  "success": true,
  "message": "Logs with level 'ERROR' retrieved successfully",
  "data": [
    {
      "logId": 3,
      "level": "ERROR",
      "serviceName": "Payment Service",
      "action": "Payment Failed",
      "message": "Payment processing failed",
      "exception": "Timeout"
    }
  ]
}
```

### cURL
```bash
curl http://localhost:5000/api/logs/level/ERROR
curl http://localhost:5000/api/logs/level/INFO
curl http://localhost:5000/api/logs/level/WARN
```

---

## 10. Get Logs by Service Name

### Request
```http
GET http://localhost:5000/api/logs/service/Medicine%20Service
```

### cURL
```bash
curl "http://localhost:5000/api/logs/service/Medicine%20Service"
curl "http://localhost:5000/api/logs/service/Order%20Service"
curl "http://localhost:5000/api/logs/service/Payment%20Service"
```

---

## 11. Get Logs by Date Range

### Request
```http
GET http://localhost:5000/api/logs/date?from=2026-08-01&to=2026-08-10
```

### Response
```json
{
  "success": true,
  "message": "Logs retrieved successfully",
  "data": [
    {
      "logId": 1,
      "timestamp": "2026-08-02T10:30:00Z",
      "level": "INFO",
      "message": "User logged in successfully"
    },
    {
      "logId": 2,
      "timestamp": "2026-08-03T11:00:00Z",
      "level": "INFO",
      "message": "Medicine viewed"
    }
  ]
}
```

### cURL
```bash
curl "http://localhost:5000/api/logs/date?from=2026-08-01&to=2026-08-10"
```

---

## 12. Delete Log

### Request
```http
DELETE http://localhost:5000/api/logs/1
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Log deleted successfully",
  "data": null
}
```

### cURL
```bash
curl -X DELETE http://localhost:5000/api/logs/1
```

---

## Error Responses

### 404 Not Found

**Request:**
```http
GET http://localhost:5000/api/logs/999
```

**Response:**
```json
{
  "success": false,
  "message": "Log with ID 999 not found",
  "data": null
}
```

---

### 400 Bad Request (Validation Error)

**Request:**
```http
POST http://localhost:5000/api/logs
Content-Type: application/json

{
  "level": "",
  "serviceName": "",
  "action": "",
  "message": ""
}
```

**Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null
}
```

---

### 400 Bad Request (Invalid Date Range)

**Request:**
```http
GET http://localhost:5000/api/logs/date?from=2026-08-10&to=2026-08-01
```

**Response:**
```json
{
  "success": false,
  "message": "'from' date must be before 'to' date",
  "data": null
}
```

---

## PowerShell Examples (Windows)

### Create Log
```powershell
$body = @{
    level = "INFO"
    serviceName = "Medicine Service"
    action = "Medicine Viewed"
    username = "test@gmail.com"
    userRole = "CUSTOMER"
    endpoint = "/api/medicines"
    httpMethod = "GET"
    statusCode = 200
    message = "Customer viewed medicine list"
    ipAddress = "127.0.0.1"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/logs" -Method Post -Body $body -ContentType "application/json"
```

### Get All Logs
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/logs" -Method Get
```

---

## Postman Collection

You can import these requests into Postman:

1. Create a new collection: "PharmaFlow Logging Service"
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:5000`
3. Add requests:
   - POST `{{baseUrl}}/api/logs` - Create Log
   - GET `{{baseUrl}}/api/logs` - Get All Logs
   - GET `{{baseUrl}}/api/logs/1` - Get Log by ID
   - GET `{{baseUrl}}/api/logs/level/ERROR` - Get Logs by Level
   - GET `{{baseUrl}}/api/logs/service/Medicine Service` - Get Logs by Service
   - GET `{{baseUrl}}/api/logs/date?from=2026-08-01&to=2026-08-10` - Get Logs by Date
   - DELETE `{{baseUrl}}/api/logs/1` - Delete Log

---

## Test Data Script

Run this to populate test data:

```bash
# User Login
curl -X POST http://localhost:5000/api/logs -H "Content-Type: application/json" -d '{"level":"INFO","serviceName":"Auth Service","action":"User Login","username":"user1@gmail.com","userRole":"CUSTOMER","endpoint":"/api/auth/login","httpMethod":"POST","statusCode":200,"message":"User logged in","ipAddress":"127.0.0.1"}'

# Medicine Viewed
curl -X POST http://localhost:5000/api/logs -H "Content-Type: application/json" -d '{"level":"INFO","serviceName":"Medicine Service","action":"Medicine Viewed","username":"user2@gmail.com","userRole":"CUSTOMER","endpoint":"/api/medicines","httpMethod":"GET","statusCode":200,"message":"Viewed medicine list","ipAddress":"127.0.0.1"}'

# Payment Failed
curl -X POST http://localhost:5000/api/logs -H "Content-Type: application/json" -d '{"level":"ERROR","serviceName":"Payment Service","action":"Payment Failed","username":"user3@gmail.com","userRole":"CUSTOMER","endpoint":"/api/payments","httpMethod":"POST","statusCode":500,"message":"Payment failed","exception":"Timeout","ipAddress":"127.0.0.1"}'

# Order Placed
curl -X POST http://localhost:5000/api/logs -H "Content-Type: application/json" -d '{"level":"INFO","serviceName":"Order Service","action":"Order Placed","username":"user4@gmail.com","userRole":"CUSTOMER","endpoint":"/api/orders","httpMethod":"POST","statusCode":201,"message":"Order placed","ipAddress":"127.0.0.1"}'
```
