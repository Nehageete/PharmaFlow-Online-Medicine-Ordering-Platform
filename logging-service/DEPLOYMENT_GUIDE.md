# Deployment Guide: Running PharmaFlow with Logging Microservice

This guide provides complete instructions to run the full PharmaFlow system with all three services.

---

## Complete System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Client (Browser)                               │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│              PharmaFlow Frontend (React)                          │
│                    Port: 3000                                     │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│         PharmaFlow Backend (Spring Boot - Port 8080)              │
│  - User Management  - Medicines    - Orders                       │
│  - Cart            - Wishlist      - Reviews                      │
└──────┬──────────────────┬──────────────────┬─────────────────────┘
       │                  │                  │
       │ OpenFeign        │ RestTemplate     │ MySQL
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐  ┌────────────────┐  ┌────────────┐
│  Payment     │  │    Logging     │  │   MySQL    │
│ Microservice │  │  Microservice  │  │  Database  │
│ (Spring Boot)│  │ (.NET 8 API)   │  │ Port: 3306 │
│  Port: 8081  │  │  Port: 5000    │  │            │
└──────┬───────┘  └────────┬───────┘  └────────────┘
       │                   │
       │ MySQL             │ SQL Server
       │                   │
       ▼                   ▼
┌──────────────┐  ┌────────────────┐
│    MySQL     │  │  SQL Server    │
│ payment_db   │  │ PharmaFlowLogs │
└──────────────┘  └────────────────┘
```

---

## Prerequisites

### Software Required

- **Java 17+**
- **Maven 3.6+**
- **.NET 8 SDK**
- **Node.js 16+**
- **MySQL 8.0+**
- **SQL Server 2019+** (or SQL Server Express)

### Verify Installations

```bash
java -version
mvn -version
dotnet --version
node -version
npm -version
mysql --version
```

---

## Step 1: Setup Databases

### 1.1 MySQL (for PharmaFlow & Payment Service)

Start MySQL:
```bash
# Windows
net start MySQL80

# Mac/Linux
sudo systemctl start mysql
```

Create databases:
```sql
mysql -u root -p

CREATE DATABASE IF NOT EXISTS pharmaflow_db;
CREATE DATABASE IF NOT EXISTS payment_db;
SHOW DATABASES;
EXIT;
```

### 1.2 SQL Server (for Logging Service)

Ensure SQL Server is running.

The Logging Service will automatically create the database on first run, or create it manually:

```sql
CREATE DATABASE PharmaFlowLogsDB;
GO
```

---

## Step 2: Configure Database Connections

### 2.1 PharmaFlow Backend

Edit `pharmaflow-backend/src/main/resources/application.properties`:

```properties
# Main database
spring.datasource.url=jdbc:mysql://localhost:3306/pharmaflow_db
spring.datasource.username=root
spring.datasource.password=your_mysql_password

# Payment Service URL
payment.service.url=http://localhost:8081

# Logging Service URL
logging.service.url=http://localhost:5000/api/logs
```

### 2.2 Payment Service

Edit `payment-service/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/payment_db
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### 2.3 Logging Service

Edit `logging-service/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```

For SQL Server Authentication:
```json
"DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;User Id=sa;Password=YourPassword;TrustServerCertificate=True"
```

---

## Step 3: Start All Services

### Terminal 1: Logging Service (.NET)

```bash
cd logging-service
dotnet restore
dotnet run
```

**Runs on:** `http://localhost:5000`

Verify:
```bash
curl http://localhost:5000/api/logs
```

Expected: `{"success":true,"message":"Logs retrieved successfully","data":[]}`

---

### Terminal 2: Payment Service (Spring Boot)

```bash
cd payment-service
mvn clean install
mvn spring-boot:run
```

**Runs on:** `http://localhost:8081`

Verify:
```bash
curl http://localhost:8081/payments
```

Expected: `[]`

---

### Terminal 3: PharmaFlow Backend (Spring Boot)

```bash
cd pharmaflow-backend
mvn clean install
mvn spring-boot:run
```

**Runs on:** `http://localhost:8080`

Verify:
```bash
curl http://localhost:8080/api/health
```

---

### Terminal 4: Frontend (React)

```bash
cd pharmaflow-frontend
npm install
npm start
```

**Runs on:** `http://localhost:3000`

Browser will automatically open.

---

## Step 4: Verify Complete Integration

### 4.1 Service Health Check

| Service | Port | URL | Status Check |
|---------|------|-----|--------------|
| Logging Service | 5000 | http://localhost:5000 | `GET /api/logs` |
| Payment Service | 8081 | http://localhost:8081 | `GET /payments` |
| PharmaFlow Backend | 8080 | http://localhost:8080 | `GET /api/health` |
| React Frontend | 3000 | http://localhost:3000 | Open in browser |

### 4.2 Test Complete Flow

1. **Register a User** (via Frontend or API)
   - Check Logging Service for "User Registration" log

2. **Login**
   - Check Logging Service for "User Login" log

3. **View Medicines**
   - Check Logging Service for "Medicine Viewed" log

4. **Add to Cart**
   - Check Logging Service for "Cart Updated" log

5. **Place Order**
   - Check Logging Service for "Order Placed" log
   - Payment Service processes payment
   - Check Logging Service for "Payment Success" or "Payment Failed" log

### 4.3 Verify Logs

Get all logs:
```bash
curl http://localhost:5000/api/logs
```

Or view in Swagger: `http://localhost:5000`

---

## Step 5: Testing Each Service

### Test Logging Service

```bash
# Create a log
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "INFO",
    "serviceName": "Test Service",
    "action": "Test Action",
    "message": "Testing logging service",
    "username": "test@gmail.com",
    "userRole": "CUSTOMER"
  }'

# Get all logs
curl http://localhost:5000/api/logs

# Get logs by level
curl http://localhost:5000/api/logs/level/INFO
```

### Test Payment Service

```bash
# Create payment (SUCCESS)
curl -X POST http://localhost:8081/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "userId": 1,
    "amount": 350.00,
    "paymentMethod": "ONLINE"
  }'

# Get all payments
curl http://localhost:8081/payments
```

### Test PharmaFlow Backend

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@pharmaflow.com",
    "password": "password123"
  }'
```

---

## Stopping Services

### Graceful Shutdown (Recommended)

Stop in this order:

1. **Frontend**: Press `Ctrl+C` in Terminal 4
2. **Backend**: Press `Ctrl+C` in Terminal 3
3. **Payment Service**: Press `Ctrl+C` in Terminal 2
4. **Logging Service**: Press `Ctrl+C` in Terminal 1

### Force Stop

```bash
# Windows
taskkill /F /IM java.exe
taskkill /F /IM dotnet.exe
taskkill /F /IM node.exe

# Mac/Linux
pkill -f spring-boot
pkill -f dotnet
pkill -f node
```

---

## Troubleshooting

### Issue 1: Logging Service - Database Connection Failed

**Error:** `Cannot connect to SQL Server`

**Solution:**
1. Verify SQL Server is running
2. Check connection string in `appsettings.json`
3. Test connection:
   ```bash
   sqlcmd -S localhost -d PharmaFlowLogsDB -E
   ```

---

### Issue 2: Payment Service - Port Already in Use

**Error:** `Port 8081 is already in use`

**Solution:**
```bash
# Find process
netstat -ano | findstr :8081    # Windows
lsof -i :8081                   # Mac/Linux

# Kill process
taskkill /PID <PID> /F          # Windows
kill -9 <PID>                   # Mac/Linux
```

---

### Issue 3: Logging Service Not Receiving Logs

**Symptoms:** Backend runs but no logs appear in Logging Service

**Solution:**
1. Verify Logging Service is running: `curl http://localhost:5000/api/logs`
2. Check `logging.service.url` in backend's `application.properties`
3. Check backend logs for connection errors
4. Ensure CORS is enabled in Logging Service

---

### Issue 4: SQL Server Authentication Failed

**Error:** `Login failed for user`

**Solution:**

Use Windows Authentication:
```json
"DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;Trusted_Connection=True;TrustServerCertificate=True"
```

Or enable SQL Server Authentication and use:
```json
"DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;User Id=sa;Password=YourPassword;TrustServerCertificate=True"
```

---

## Running in Production

### Using Standalone Executables

**Logging Service:**
```bash
cd logging-service
dotnet publish -c Release -o ./publish
cd publish
dotnet PharmaFlow.LoggingService.dll
```

**Payment Service:**
```bash
cd payment-service
mvn clean package
java -jar target/payment-service-1.0.0.jar
```

**PharmaFlow Backend:**
```bash
cd pharmaflow-backend
mvn clean package
java -jar target/pharmaflow-backend.jar
```

**Frontend:**
```bash
cd pharmaflow-frontend
npm run build
serve -s build -p 3000
```

---

## Service Ports Summary

| Service | Port | Protocol | Database |
|---------|------|----------|----------|
| Logging Service | 5000 | HTTP | SQL Server |
| Payment Service | 8081 | HTTP | MySQL |
| PharmaFlow Backend | 8080 | HTTP | MySQL |
| React Frontend | 3000 | HTTP | - |
| MySQL | 3306 | TCP | - |
| SQL Server | 1433 | TCP | - |

---

## Monitoring Logs

### Logging Service Logs
```bash
# Console output or configure Serilog
dotnet run
```

### Payment Service Logs
```bash
tail -f payment-service/logs/application.log
```

### Backend Logs
```bash
tail -f pharmaflow-backend/logs/application.log
```

### Check Database Logs

**MySQL:**
```sql
USE payment_db;
SELECT * FROM payments ORDER BY payment_date DESC LIMIT 10;
```

**SQL Server:**
```sql
USE PharmaFlowLogsDB;
SELECT TOP 10 * FROM Logs ORDER BY Timestamp DESC;
```

---

## Quick Start Script (All Services)

Create `start-all.sh` (Linux/Mac) or `start-all.bat` (Windows):

**Windows (start-all.bat):**
```batch
@echo off
start cmd /k "cd logging-service && dotnet run"
timeout /t 5
start cmd /k "cd payment-service && mvn spring-boot:run"
timeout /t 10
start cmd /k "cd pharmaflow-backend && mvn spring-boot:run"
timeout /t 10
start cmd /k "cd pharmaflow-frontend && npm start"
```

**Linux/Mac (start-all.sh):**
```bash
#!/bin/bash
cd logging-service && dotnet run &
sleep 5
cd payment-service && mvn spring-boot:run &
sleep 10
cd pharmaflow-backend && mvn spring-boot:run &
sleep 10
cd pharmaflow-frontend && npm start &
```

---

## Summary

Your complete PharmaFlow system is now running with:

1. ✅ **Logging Service** (.NET) - Centralized logging on port 5000
2. ✅ **Payment Service** (Spring Boot) - Payment processing on port 8081
3. ✅ **PharmaFlow Backend** (Spring Boot) - Main API on port 8080
4. ✅ **React Frontend** - UI on port 3000

All services communicate seamlessly:
- Backend → Logging Service (REST API)
- Backend → Payment Service (OpenFeign)
- Frontend → Backend (HTTP)

For detailed integration guides, see:
- [SPRING_BOOT_INTEGRATION.md](SPRING_BOOT_INTEGRATION.md)
- [README.md](README.md)
- [SAMPLE_REQUESTS.md](SAMPLE_REQUESTS.md)





------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  1 # Deployment Guide: Running PharmaFlow with Logging Microservice
    2 
    3 This guide provides complete instructions to run the full PharmaFlow system with all three services.
    4 
    5 ---
    6 
    7 ## Complete System Architecture
    8
    9 ```
   10 ┌──────────────────────────────────────────────────────────────────┐
   11 │                    Client (Browser)                               │
   12 └────────────────────────────┬─────────────────────────────────────┘
   13                              │
   14                              ▼
   15 ┌──────────────────────────────────────────────────────────────────┐
   16 │              PharmaFlow Frontend (React)                          │
   17 │                    Port: 3000                                     │
   18 └────────────────────────────┬─────────────────────────────────────┘
   19                              │
   20                              ▼
   21 ┌──────────────────────────────────────────────────────────────────┐
   22 │         PharmaFlow Backend (Spring Boot - Port 8080)              │
   23 │  - User Management  - Medicines    - Orders                       │
   24 │  - Cart            - Wishlist      - Reviews                      │
   25 └──────┬──────────────────┬──────────────────┬─────────────────────┘
   26        │                  │                  │
   27        │ OpenFeign        │ RestTemplate     │ MySQL
   28        │                  │                  │
   29        ▼                  ▼                  ▼
   30 ┌──────────────┐  ┌────────────────┐  ┌────────────┐
   31 │  Payment     │  │    Logging     │  │   MySQL    │
   32 │ Microservice │  │  Microservice  │  │  Database  │
   33 │ (Spring Boot)│  │ (.NET 8 API)   │  │ Port: 3306 │
   34 │  Port: 8081  │  │  Port: 5000    │  │            │
   35 └──────┬───────┘  └────────┬───────┘  └────────────┘
   36        │                   │
   37        │ MySQL             │ SQL Server
   38        │                   │
   39        ▼                   ▼
   40 ┌──────────────┐  ┌────────────────┐
   41 │    MySQL     │  │  SQL Server    │
   42 │ payment_db   │  │ PharmaFlowLogs │
   43 └──────────────┘  └────────────────┘
   44 ```
   45
   46 ---
   47
   48 ## Prerequisites
   49
   50 ### Software Required
   51
   52 - **Java 17+**
   53 - **Maven 3.6+**
   54 - **.NET 8 SDK**
   55 - **Node.js 16+**
   56 - **MySQL 8.0+**
   57 - **SQL Server 2019+** (or SQL Server Express)
   58
   59 ### Verify Installations
   60
   61 ```bash
   62 java -version
   63 mvn -version
   64 dotnet --version
   65 node -version
   66 npm -version
   67 mysql --version
   68 ```
   69
   70 ---
   71
   72 ## Step 1: Setup Databases
   73
   74 ### 1.1 MySQL (for PharmaFlow & Payment Service)
   75
   76 Start MySQL:
   77 ```bash
   78 # Windows
   79 net start MySQL80
   80
   81 # Mac/Linux
   82 sudo systemctl start mysql
   83 ```
   84
   85 Create databases:
   86 ```sql
   87 mysql -u root -p
   88
   89 CREATE DATABASE IF NOT EXISTS pharmaflow_db;
   90 CREATE DATABASE IF NOT EXISTS payment_db;
   91 SHOW DATABASES;
   92 EXIT;
   93 ```
   94
   95 ### 1.2 SQL Server (for Logging Service)
   96
   97 Ensure SQL Server is running.
   98
   99 The Logging Service will automatically create the database on first run, or create it manually:
  100
  101 ```sql
  102 CREATE DATABASE PharmaFlowLogsDB;
  103 GO
  104 ```
  105
  106 ---
  107
  108 ## Step 2: Configure Database Connections
  109
  110 ### 2.1 PharmaFlow Backend
  111
  112 Edit `pharmaflow-backend/src/main/resources/application.properties`:
  113
  114 ```properties
  115 # Main database
  116 spring.datasource.url=jdbc:mysql://localhost:3306/pharmaflow_db
  117 spring.datasource.username=root
  118 spring.datasource.password=your_mysql_password
  119
  120 # Payment Service URL
  121 payment.service.url=http://localhost:8081
  122
  123 # Logging Service URL
  124 logging.service.url=http://localhost:5000/api/logs
  125 ```
  126
  127 ### 2.2 Payment Service
  128
  129 Edit `payment-service/src/main/resources/application.properties`:
  130
  131 ```properties
  132 spring.datasource.url=jdbc:mysql://localhost:3306/payment_db
  133 spring.datasource.username=root
  134 spring.datasource.password=your_mysql_password
  135 ```
  136
  137 ### 2.3 Logging Service
  138
  139 Edit `logging-service/appsettings.json`:
  140
  141 ```json
  142 {
  143   "ConnectionStrings": {
  144     "DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;Trusted_Connection=True;TrustServerCer
      tificate=True;MultipleActiveResultSets=true"
  145   }
  146 }
  147 ```
  148
  149 For SQL Server Authentication:
  150 ```json
  151 "DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;User Id=sa;Password=YourPassword;TrustServ
      erCertificate=True"
  152 ```
  153
  154 ---
  155
  156 ## Step 3: Start All Services
  157
  158 ### Terminal 1: Logging Service (.NET)
  159
  160 ```bash
  161 cd logging-service
  162 dotnet restore
  163 dotnet run
  164 ```
  165
  166 **Runs on:** `http://localhost:5000`
  167
  168 Verify:
  169 ```bash
  170 curl http://localhost:5000/api/logs
  171 ```
  172
  173 Expected: `{"success":true,"message":"Logs retrieved successfully","data":[]}`
  174
  175 ---
  176
  177 ### Terminal 2: Payment Service (Spring Boot)
  178
  179 ```bash
  180 cd payment-service
  181 mvn clean install
  182 mvn spring-boot:run
  183 ```
  184
  185 **Runs on:** `http://localhost:8081`
  186
  187 Verify:
  188 ```bash
  189 curl http://localhost:8081/payments
  190 ```
  191
  192 Expected: `[]`
  193
  194 ---
  195
  196 ### Terminal 3: PharmaFlow Backend (Spring Boot)
  197
  198 ```bash
  199 cd pharmaflow-backend
  200 mvn clean install
  201 mvn spring-boot:run
  202 ```
  203
  204 **Runs on:** `http://localhost:8080`
  205
  206 Verify:
  207 ```bash
  208 curl http://localhost:8080/api/health
  209 ```
  210
  211 ---
  212
  213 ### Terminal 4: Frontend (React)
  214
  215 ```bash
  216 cd pharmaflow-frontend
  217 npm install
  218 npm start
  219 ```
  220
  221 **Runs on:** `http://localhost:3000`
  222
  223 Browser will automatically open.
  224
  225 ---
  226
  227 ## Step 4: Verify Complete Integration
  228
  229 ### 4.1 Service Health Check
  230
  231 | Service | Port | URL | Status Check |
  232 |---------|------|-----|--------------|
  233 | Logging Service | 5000 | http://localhost:5000 | `GET /api/logs` |
  234 | Payment Service | 8081 | http://localhost:8081 | `GET /payments` |
  235 | PharmaFlow Backend | 8080 | http://localhost:8080 | `GET /api/health` |
  236 | React Frontend | 3000 | http://localhost:3000 | Open in browser |
  237
  238 ### 4.2 Test Complete Flow
  239
  240 1. **Register a User** (via Frontend or API)
  241    - Check Logging Service for "User Registration" log
  242
  243 2. **Login**
  244    - Check Logging Service for "User Login" log
  245
  246 3. **View Medicines**
  247    - Check Logging Service for "Medicine Viewed" log
  248
  249 4. **Add to Cart**
  250    - Check Logging Service for "Cart Updated" log
  251
  252 5. **Place Order**
  253    - Check Logging Service for "Order Placed" log
  254    - Payment Service processes payment
  255    - Check Logging Service for "Payment Success" or "Payment Failed" log
  256
  257 ### 4.3 Verify Logs
  258
  259 Get all logs:
  260 ```bash
  261 curl http://localhost:5000/api/logs
  262 ```
  263
  264 Or view in Swagger: `http://localhost:5000`
  265
  266 ---
  267
  268 ## Step 5: Testing Each Service
  269
  270 ### Test Logging Service
  271
  272 ```bash
  273 # Create a log
  274 curl -X POST http://localhost:5000/api/logs \
  275   -H "Content-Type: application/json" \
  276   -d '{
  277     "level": "INFO",
  278     "serviceName": "Test Service",
  279     "action": "Test Action",
  280     "message": "Testing logging service",
  281     "username": "test@gmail.com",
  282     "userRole": "CUSTOMER"
  283   }'
  284
  285 # Get all logs
  286 curl http://localhost:5000/api/logs
  287
  288 # Get logs by level
  289 curl http://localhost:5000/api/logs/level/INFO
  290 ```
  291
  292 ### Test Payment Service
  293
  294 ```bash
  295 # Create payment (SUCCESS)
  296 curl -X POST http://localhost:8081/payments \
  297   -H "Content-Type: application/json" \
  298   -d '{
  299     "orderId": 1,
  300     "userId": 1,
  301     "amount": 350.00,
  302     "paymentMethod": "ONLINE"
  303   }'
  304
  305 # Get all payments
  306 curl http://localhost:8081/payments
  307 ```
  308
  309 ### Test PharmaFlow Backend
  310
  311 ```bash
  312 # Login
  313 curl -X POST http://localhost:8080/api/auth/login \
  314   -H "Content-Type: application/json" \
  315   -d '{
  316     "email": "customer@pharmaflow.com",
  317     "password": "password123"
  318   }'
  319 ```
  320
  321 ---
  322
  323 ## Stopping Services
  324
  325 ### Graceful Shutdown (Recommended)
  326
  327 Stop in this order:
  328
  329 1. **Frontend**: Press `Ctrl+C` in Terminal 4
  330 2. **Backend**: Press `Ctrl+C` in Terminal 3
  331 3. **Payment Service**: Press `Ctrl+C` in Terminal 2
  332 4. **Logging Service**: Press `Ctrl+C` in Terminal 1
  333
  334 ### Force Stop
  335
  336 ```bash
  337 # Windows
  338 taskkill /F /IM java.exe
  339 taskkill /F /IM dotnet.exe
  340 taskkill /F /IM node.exe
  341
  342 # Mac/Linux
  343 pkill -f spring-boot
  344 pkill -f dotnet
  345 pkill -f node
  346 ```
  347
  348 ---
  349
  350 ## Troubleshooting
  351
  352 ### Issue 1: Logging Service - Database Connection Failed
  353
  354 **Error:** `Cannot connect to SQL Server`
  355
  356 **Solution:**
  357 1. Verify SQL Server is running
  358 2. Check connection string in `appsettings.json`
  359 3. Test connection:
  360    ```bash
  361    sqlcmd -S localhost -d PharmaFlowLogsDB -E
  362    ```
  363
  364 ---
  365
  366 ### Issue 2: Payment Service - Port Already in Use
  367
  368 **Error:** `Port 8081 is already in use`
  369
  370 **Solution:**
  371 ```bash
  372 # Find process
  373 netstat -ano | findstr :8081    # Windows
  374 lsof -i :8081                   # Mac/Linux
  375
  376 # Kill process
  377 taskkill /PID <PID> /F          # Windows
  378 kill -9 <PID>                   # Mac/Linux
  379 ```
  380
  381 ---
  382
  383 ### Issue 3: Logging Service Not Receiving Logs
  384
  385 **Symptoms:** Backend runs but no logs appear in Logging Service
  386
  387 **Solution:**
  388 1. Verify Logging Service is running: `curl http://localhost:5000/api/logs`
  389 2. Check `logging.service.url` in backend's `application.properties`
  390 3. Check backend logs for connection errors
  391 4. Ensure CORS is enabled in Logging Service
  392
  393 ---
  394
  395 ### Issue 4: SQL Server Authentication Failed
  396
  397 **Error:** `Login failed for user`
  398
  399 **Solution:**
  400
  401 Use Windows Authentication:
  402 ```json
  403 "DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;Trusted_Connection=True;TrustServerCertifi
      cate=True"
  404 ```
  405
  406 Or enable SQL Server Authentication and use:
  407 ```json
  408 "DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;User Id=sa;Password=YourPassword;TrustServ
      erCertificate=True"
  409 ```
  410
  411 ---
  412
  413 ## Running in Production
  414
  415 ### Using Standalone Executables
  416
  417 **Logging Service:**
  418 ```bash
  419 cd logging-service
  420 dotnet publish -c Release -o ./publish
  421 cd publish
  422 dotnet PharmaFlow.LoggingService.dll
  423 ```
  424
  425 **Payment Service:**
  426 ```bash
  427 cd payment-service
  428 mvn clean package
  429 java -jar target/payment-service-1.0.0.jar
  430 ```
  431
  432 **PharmaFlow Backend:**
  433 ```bash
  434 cd pharmaflow-backend
  435 mvn clean package
  436 java -jar target/pharmaflow-backend.jar
  437 ```
  438
  439 **Frontend:**
  440 ```bash
  441 cd pharmaflow-frontend
  442 npm run build
  443 serve -s build -p 3000
  444 ```
  445
  446 ---
  447
  448 ## Service Ports Summary
  449
  450 | Service | Port | Protocol | Database |
  451 |---------|------|----------|----------|
  452 | Logging Service | 5000 | HTTP | SQL Server |
  453 | Payment Service | 8081 | HTTP | MySQL |
  454 | PharmaFlow Backend | 8080 | HTTP | MySQL |
  455 | React Frontend | 3000 | HTTP | - |
  456 | MySQL | 3306 | TCP | - |
  457 | SQL Server | 1433 | TCP | - |
  458
  459 ---
  460
  461 ## Monitoring Logs
  462
  463 ### Logging Service Logs
  464 ```bash
  465 # Console output or configure Serilog
  466 dotnet run
  467 ```
  468
  469 ### Payment Service Logs
  470 ```bash
  471 tail -f payment-service/logs/application.log
  472 ```
  473
  474 ### Backend Logs
  475 ```bash
  476 tail -f pharmaflow-backend/logs/application.log
  477 ```
  478
  479 ### Check Database Logs
  480
  481 **MySQL:**
  482 ```sql
  483 USE payment_db;
  484 SELECT * FROM payments ORDER BY payment_date DESC LIMIT 10;
  485 ```
  486
  487 **SQL Server:**
  488 ```sql
  489 USE PharmaFlowLogsDB;
  490 SELECT TOP 10 * FROM Logs ORDER BY Timestamp DESC;
  491 ```
  492
  493 ---
  494
  495 ## Quick Start Script (All Services)
  496
  497 Create `start-all.sh` (Linux/Mac) or `start-all.bat` (Windows):
  498
  499 **Windows (start-all.bat):**
  500 ```batch
  501 @echo off
  502 start cmd /k "cd logging-service && dotnet run"
  503 timeout /t 5
  504 start cmd /k "cd payment-service && mvn spring-boot:run"
  505 timeout /t 10
  506 start cmd /k "cd pharmaflow-backend && mvn spring-boot:run"
  507 timeout /t 10
  508 start cmd /k "cd pharmaflow-frontend && npm start"
  509 ```
  510
  511 **Linux/Mac (start-all.sh):**
  512 ```bash
  513 #!/bin/bash
  514 cd logging-service && dotnet run &
  515 sleep 5
  516 cd payment-service && mvn spring-boot:run &
  517 sleep 10
  518 cd pharmaflow-backend && mvn spring-boot:run &
  519 sleep 10
  520 cd pharmaflow-frontend && npm start &
  521 ```
  522
  523 ---
  524
  525 ## Summary
  526
  527 Your complete PharmaFlow system is now running with:
  528
  529 1. ✅ **Logging Service** (.NET) - Centralized logging on port 5000
  530 2. ✅ **Payment Service** (Spring Boot) - Payment processing on port 8081
  531 3. ✅ **PharmaFlow Backend** (Spring Boot) - Main API on port 8080
  532 4. ✅ **React Frontend** - UI on port 3000
  533
  534 All services communicate seamlessly:
  535 - Backend → Logging Service (REST API)
  536 - Backend → Payment Service (OpenFeign)
  537 - Frontend → Backend (HTTP)
  538
  539 For detailed integration guides, see:
  540 - [SPRING_BOOT_INTEGRATION.md](SPRING_BOOT_INTEGRATION.md)
  541 - [README.md](README.md)
  542 - [SAMPLE_REQUESTS.md](SAMPLE_REQUESTS.md)
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  542 - [SAMPLE_REQUESTS.md](SAMPLE_REQUESTS.md)
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
● Write(logging-service\DEPLOYMENT_GUIDE.md)
  ⎿  Wrote 542 lines to logging-service\DEPLOYMENT_GUIDE.md
       1 # Deployment Guide: Running PharmaFlow with Logging Microservice
       2 
       3 This guide provides complete instructions to run the full PharmaFlow system with all three services.
       4 
       5 ---
       6 
       7 ## Complete System Architecture
       8 
       9 ```
      10 ┌──────────────────────────────────────────────────────────────────┐
     … +536 lines (ctrl+o to expand)

● Perfect! I've successfully created a complete ASP.NET Core 8 Logging Microservice for your PharmaFlow platform.
  Let me summarize what has been delivered:

  Complete Logging Microservice Created

  Project Structure ✅

  logging-service/
  ├── Controllers/
  │   └── LogsController.cs (All 7 REST endpoints)
  ├── Services/
  │   ├── Interfaces/ILogService.cs
  │   └── Implementations/LogService.cs
  ├── Repositories/
  │   ├── Interfaces/ILogRepository.cs
  │   └── Implementations/LogRepository.cs (Repository Pattern)
  ├── Entities/
  │   └── Log.cs (Entity with all required fields)
  ├── DTOs/
  │   ├── CreateLogDto.cs (with validation)
  │   └── LogResponseDto.cs
  ├── Data/
  │   └── ApplicationDbContext.cs (EF Core DbContext)
  ├── Middleware/
  │   └── GlobalExceptionMiddleware.cs
  ├── Models/
  │   └── ApiResponse.cs (Standard response wrapper)
  ├── Properties/
  │   └── launchSettings.json
  ├── appsettings.json
  ├── Program.cs (DI, Swagger, CORS configured)
  └── PharmaFlow.LoggingService.csproj

  Features Implemented ✅

  1. Clean Architecture
  - Repository Pattern
  - Service Layer
  - DTO Mapping
  - Dependency Injection
  - SOLID Principles

  2. All Required APIs
  - ✅ POST /api/logs - Create log
  - ✅ GET /api/logs - Get all logs
  - ✅ GET /api/logs/{id} - Get log by ID
  - ✅ GET /api/logs/level/{level} - Filter by level
  - ✅ GET /api/logs/service/{serviceName} - Filter by service
  - ✅ GET /api/logs/date?from=&to= - Filter by date range
  - ✅ DELETE /api/logs/{id} - Delete log

  3. Database
  - SQL Server with EF Core
  - Entity with all 13 required fields
  - Automatic migrations
  - Indexes for performance

  4. Validation
  - Data Annotations on DTOs
  - Required field validation
  - MaxLength validation
  - Automatic timestamp generation

  5. Error Handling
  - Global Exception Middleware
  - Consistent API response format
  - Meaningful error messages

  6. Documentation
  - ✅ README.md - Complete overview
  - ✅ SPRING_BOOT_INTEGRATION.md - Integration with Spring Boot
  - ✅ SQL_SETUP.md - Database setup guide
  - ✅ SAMPLE_REQUESTS.md - API examples with cURL
  - ✅ DEPLOYMENT_GUIDE.md - Complete deployment instructions

  7. Configuration
  - Swagger UI enabled (auto-documentation)
  - CORS configured for Spring Boot integration
  - Runs on port 5000

  How to Run

  cd logging-service
  dotnet restore
  dotnet run

  Access Swagger UI: http://localhost:5000

  Spring Boot Integration

  Your existing PharmaFlow backend can send logs using RestTemplate:

  @Service
  public class LoggingClient {
      private final RestTemplate restTemplate;

      @Value("${logging.service.url:http://localhost:5000/api/logs}")
      private String loggingServiceUrl;

      @Async
      public void sendLog(LogRequest logRequest) {
          restTemplate.postForEntity(loggingServiceUrl, logRequest, Void.class);
      }
  }

  Key Highlights

  1. Production-Ready: No placeholders, fully functional code
  2. Best Practices: Following .NET 8 standards
  3. Independent: Completely separate from Spring Boot
  4. Scalable: Clean architecture for future enhancements
  5. Well-Documented: Comprehensive guides for integration and deployment

  All tasks completed successfully! The Logging Microservice is ready to receive logs from your PharmaFlow Spring
  Boot application.
