# Deployment Guide: Running PharmaFlow with Payment Microservice

This guide provides step-by-step instructions to run the complete PharmaFlow application with the Payment Microservice.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PharmaFlow Frontend (React)                     │
│                    Port: 3000                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         PharmaFlow Backend (Spring Boot Monolith)            │
│                    Port: 8080                                │
│  - User Management    - Medicines      - Orders              │
│  - Cart              - Wishlist       - Reviews              │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             │ OpenFeign                 │ Database
             │                           │
             ▼                           ▼
┌──────────────────────────┐   ┌────────────────────┐
│  Payment Microservice    │   │  MySQL Database    │
│      Port: 8081          │   │    Port: 3306      │
│  - Payment Processing    │   │  - pharmaflow_db   │
│  - Fake Gateway          │   │  - payment_db      │
│  - Refunds               │   │                    │
└──────────────┬───────────┘   └────────────────────┘
               │
               │ Database
               ▼
      ┌────────────────────┐
      │  MySQL Database    │
      │    payment_db      │
      └────────────────────┘
```

---

## Prerequisites

Before starting, ensure you have:

- **Java 17** or higher
- **Maven 3.6+**
- **MySQL 8.0+**
- **Node.js 16+** (for React frontend)
- **Git**

Verify installations:

```bash
java -version
mvn -version
mysql --version
node -version
npm -version
```

---

## Step 1: Setup MySQL Databases

### 1.1 Start MySQL Server

```bash
# For Windows
net start MySQL80

# For Mac/Linux
sudo systemctl start mysql
```

### 1.2 Create Databases

Login to MySQL:

```bash
mysql -u root -p
```

Create both databases:

```sql
-- PharmaFlow main database
CREATE DATABASE IF NOT EXISTS pharmaflow_db;

-- Payment microservice database
CREATE DATABASE IF NOT EXISTS payment_db;

-- Verify databases
SHOW DATABASES;

-- Exit
EXIT;
```

### 1.3 Initialize Payment Database Schema

Navigate to payment service and run schema:

```bash
cd payment-service/database
mysql -u root -p payment_db < schema.sql
```

Or manually run the schema from MySQL:

```sql
USE payment_db;

CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    payment_date DATETIME NOT NULL,
    gateway_response VARCHAR(1000),
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_id (transaction_id)
);
```

---

## Step 2: Configure Database Credentials

### 2.1 Payment Service Configuration

Edit `payment-service/src/main/resources/application.properties`:

```properties
# Update these with your MySQL credentials
spring.datasource.url=jdbc:mysql://localhost:3306/payment_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### 2.2 PharmaFlow Backend Configuration

Edit your PharmaFlow backend's `application.properties`:

```properties
# Main database
spring.datasource.url=jdbc:mysql://localhost:3306/pharmaflow_db
spring.datasource.username=root
spring.datasource.password=your_mysql_password

# Payment Service URL
payment.service.url=http://localhost:8081
```

---

## Step 3: Start Payment Microservice

### 3.1 Navigate to Payment Service

```bash
cd payment-service
```

### 3.2 Build the Project

```bash
mvn clean install
```

Expected output:
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX.XXX s
```

### 3.3 Run the Payment Service

```bash
mvn spring-boot:run
```

**OR** run the JAR directly:

```bash
java -jar target/payment-service-1.0.0.jar
```

### 3.4 Verify Payment Service is Running

You should see:

```
Started PaymentServiceApplication in X.XXX seconds
```

Test the service:

```bash
curl http://localhost:8081/payments
```

Expected response: `[]` (empty array)

**Keep this terminal open** - Payment service is now running on port 8081.

---

## Step 4: Start PharmaFlow Backend

### 4.1 Open a New Terminal

Navigate to your PharmaFlow backend directory:

```bash
cd /path/to/pharmaflow-backend
```

### 4.2 Build the Backend

```bash
mvn clean install
```

### 4.3 Run PharmaFlow Backend

```bash
mvn spring-boot:run
```

**OR**:

```bash
java -jar target/pharmaflow-backend.jar
```

### 4.4 Verify Backend is Running

You should see:

```
Started PharmaFlowApplication in X.XXX seconds
```

Test the backend:

```bash
curl http://localhost:8080/api/health
```

**Keep this terminal open** - Backend is now running on port 8080.

---

## Step 5: Start PharmaFlow Frontend

### 5.1 Open Another New Terminal

Navigate to your React frontend directory:

```bash
cd /path/to/pharmaflow-frontend
```

### 5.2 Install Dependencies (First Time Only)

```bash
npm install
```

### 5.3 Start the Frontend

```bash
npm start
```

The React app will start on `http://localhost:3000` and automatically open in your browser.

---

## Step 6: Verify Complete Integration

### 6.1 Check All Services are Running

You should now have **3 terminal windows** running:

1. **Terminal 1**: Payment Service (Port 8081)
2. **Terminal 2**: PharmaFlow Backend (Port 8080)
3. **Terminal 3**: React Frontend (Port 3000)

### 6.2 Test the Payment Flow

#### Option A: Using the Frontend

1. Open browser: `http://localhost:3000`
2. Register/Login as a customer
3. Add medicines to cart
4. Proceed to checkout
5. Select payment method (ONLINE or COD)
6. Place order
7. Verify order status changes based on payment result

#### Option B: Using API Directly

**Create an Order with Payment:**

```bash
# Login to get JWT token first
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@pharmaflow.com",
    "password": "password123"
  }'

# Use the token to create an order
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "medicineId": 1,
        "quantity": 2
      }
    ],
    "paymentMethod": "ONLINE"
  }'
```

Expected Flow:
1. Order created with status `PAYMENT_PENDING`
2. Backend calls Payment Service
3. Payment processed (SUCCESS/FAILED)
4. Order status updated to `CONFIRMED` or `PAYMENT_FAILED`
5. Response returned with payment details

---

## Step 7: Testing Payment Scenarios

### 7.1 Test Successful Payment

Use an amount that ends in 0-7:

```bash
curl -X POST http://localhost:8081/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "userId": 1,
    "amount": 350.00,
    "paymentMethod": "ONLINE"
  }'
```

Expected: `"paymentStatus": "SUCCESS"`

### 7.2 Test Failed Payment

Use an amount that ends in 8 or 9:

```bash
curl -X POST http://localhost:8081/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 2,
    "userId": 1,
    "amount": 358.00,
    "paymentMethod": "ONLINE"
  }'
```

Expected: `"paymentStatus": "FAILED"`

### 7.3 Test COD Payment

```bash
curl -X POST http://localhost:8081/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 3,
    "userId": 1,
    "amount": 450.00,
    "paymentMethod": "COD"
  }'
```

Expected: `"paymentStatus": "PENDING"`

---

## Troubleshooting

### Issue 1: Payment Service Not Starting

**Error:** `Port 8081 is already in use`

**Solution:**
```bash
# Find process using port 8081
netstat -ano | findstr :8081    # Windows
lsof -i :8081                   # Mac/Linux

# Kill the process
taskkill /PID <PID> /F          # Windows
kill -9 <PID>                   # Mac/Linux
```

---

### Issue 2: Database Connection Failed

**Error:** `Access denied for user 'root'@'localhost'`

**Solution:**
- Verify MySQL is running
- Check username and password in `application.properties`
- Ensure databases exist: `SHOW DATABASES;`

---

### Issue 3: Payment Service Not Reachable from Backend

**Error:** `Connection refused: http://localhost:8081`

**Solution:**
- Verify Payment Service is running: `curl http://localhost:8081/payments`
- Check firewall settings
- Verify `payment.service.url` in backend's `application.properties`

---

### Issue 4: OpenFeign Client Error

**Error:** `FeignException: status 404 reading PaymentServiceClient`

**Solution:**
- Ensure Payment Service is running
- Check endpoint URLs match exactly
- Enable Feign logging in `application.properties`:

```properties
logging.level.com.pharmaflow.client.PaymentServiceClient=DEBUG
```

---

## Stopping the Services

### Graceful Shutdown

Stop services in this order:

1. **Frontend**: Press `Ctrl+C` in terminal 3
2. **Backend**: Press `Ctrl+C` in terminal 2
3. **Payment Service**: Press `Ctrl+C` in terminal 1

### Force Stop (if needed)

```bash
# Windows
taskkill /F /IM java.exe

# Mac/Linux
pkill -f spring-boot
```

---

## Running in Production

### Using JAR Files

Build all services:

```bash
# Payment Service
cd payment-service
mvn clean package
java -jar target/payment-service-1.0.0.jar &

# PharmaFlow Backend
cd ../pharmaflow-backend
mvn clean package
java -jar target/pharmaflow-backend.jar &

# Frontend
cd ../pharmaflow-frontend
npm run build
serve -s build -p 3000
```

### Using Docker (Advanced)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: pharmaflow_db
    ports:
      - "3306:3306"

  payment-service:
    build: ./payment-service
    ports:
      - "8081:8081"
    depends_on:
      - mysql

  pharmaflow-backend:
    build: ./pharmaflow-backend
    ports:
      - "8080:8080"
    depends_on:
      - mysql
      - payment-service

  pharmaflow-frontend:
    build: ./pharmaflow-frontend
    ports:
      - "3000:3000"
    depends_on:
      - pharmaflow-backend
```

Run:
```bash
docker-compose up
```

---

## Service Endpoints Summary

| Service | Port | URL | Health Check |
|---------|------|-----|--------------|
| Payment Service | 8081 | http://localhost:8081 | `GET /payments` |
| PharmaFlow Backend | 8080 | http://localhost:8080 | `GET /api/health` |
| React Frontend | 3000 | http://localhost:3000 | Open in browser |
| MySQL | 3306 | localhost:3306 | `mysql -u root -p` |

---

## Quick Start Commands (Summary)

```bash
# Terminal 1 - Payment Service
cd payment-service
mvn spring-boot:run

# Terminal 2 - Backend
cd pharmaflow-backend
mvn spring-boot:run

# Terminal 3 - Frontend
cd pharmaflow-frontend
npm start
```

---

## Monitoring Logs

### Payment Service Logs

```bash
tail -f payment-service/logs/application.log
```

### Backend Logs

```bash
tail -f pharmaflow-backend/logs/application.log
```

### Check MySQL Transactions

```sql
USE payment_db;
SELECT * FROM payments ORDER BY payment_date DESC LIMIT 10;
```

---

## Next Steps

1. Test all payment scenarios (SUCCESS, FAILED, COD)
2. Test order creation flow from frontend
3. Test payment history retrieval
4. Test refund functionality
5. Monitor logs for any errors
6. Add more test data as needed

---

## Support

If you encounter issues:

1. Check all services are running
2. Verify database connections
3. Review application logs
4. Ensure correct ports are used
5. Check firewall settings

For detailed API documentation, see:
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- [SAMPLE_REQUESTS.md](SAMPLE_REQUESTS.md)
