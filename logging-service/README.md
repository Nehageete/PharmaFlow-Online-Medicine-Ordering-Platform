# PharmaFlow Logging Service

## Overview

The PharmaFlow Logging Service is an independent microservice built with **ASP.NET Core 8 Web API** that handles centralized logging for the PharmaFlow e-commerce platform. It receives log data from the Spring Boot backend via REST API calls and stores them in SQL Server.

## Technology Stack

- **Framework**: ASP.NET Core 8 Web API
- **Database**: SQL Server
- **ORM**: Entity Framework Core 8
- **Documentation**: Swagger/OpenAPI
- **Architecture**: Clean Architecture with Repository Pattern

## Project Structure

```
PharmaFlow.LoggingService/
├── Controllers/
│   └── LogsController.cs
├── Services/
│   ├── Interfaces/
│   │   └── ILogService.cs
│   └── Implementations/
│       └── LogService.cs
├── Repositories/
│   ├── Interfaces/
│   │   └── ILogRepository.cs
│   └── Implementations/
│       └── LogRepository.cs
├── Entities/
│   └── Log.cs
├── DTOs/
│   ├── CreateLogDto.cs
│   └── LogResponseDto.cs
├── Data/
│   └── ApplicationDbContext.cs
├── Middleware/
│   └── GlobalExceptionMiddleware.cs
├── Models/
│   └── ApiResponse.cs
├── Properties/
│   └── launchSettings.json
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

## Database Schema

**Database Name**: `PharmaFlowLogsDB`

**Table**: `Logs`

| Column | Type | Description |
|--------|------|-------------|
| LogId | BIGINT | Primary key (auto-increment) |
| Timestamp | DATETIME | Log timestamp (UTC) |
| Level | NVARCHAR(50) | Log level (INFO, ERROR, WARN, etc.) |
| ServiceName | NVARCHAR(100) | Service name |
| Action | NVARCHAR(200) | Action performed |
| Username | NVARCHAR(100) | User who performed the action |
| UserRole | NVARCHAR(50) | User role (ADMIN, CUSTOMER, PHARMACIST) |
| Endpoint | NVARCHAR(500) | API endpoint |
| HttpMethod | NVARCHAR(10) | HTTP method (GET, POST, etc.) |
| StatusCode | INT | HTTP status code |
| Message | NVARCHAR(2000) | Log message |
| Exception | NVARCHAR(4000) | Exception details (if any) |
| IpAddress | NVARCHAR(50) | Client IP address |

**Indexes**:
- `IX_Logs_Timestamp`
- `IX_Logs_Level`
- `IX_Logs_ServiceName`
- `IX_Logs_Username`

## Prerequisites

- **.NET 8 SDK**
- **SQL Server 2019+** (or SQL Server Express)
- **Visual Studio 2022** or **VS Code**

## Setup Instructions

### 1. Install SQL Server

Ensure SQL Server is installed and running.

### 2. Update Connection String

Edit `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```

For SQL Server Authentication:
```json
"DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;User Id=sa;Password=YourPassword;TrustServerCertificate=True;MultipleActiveResultSets=true"
```

### 3. Restore NuGet Packages

```bash
cd logging-service
dotnet restore
```

### 4. Run Database Migrations

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

Or the migrations will run automatically when the application starts.

### 5. Run the Application

```bash
dotnet run
```

The service will start on:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`

### 6. Access Swagger UI

Open your browser and navigate to:
```
http://localhost:5000
```

Swagger UI will display all available endpoints with examples.

## API Endpoints

### 1. Create Log
**POST** `/api/logs`

Create a new log entry.

**Request Body**:
```json
{
  "level": "INFO",
  "serviceName": "Medicine Service",
  "action": "Medicine Viewed",
  "username": "tanvi123@gmail.com",
  "userRole": "CUSTOMER",
  "endpoint": "/medicines",
  "httpMethod": "GET",
  "statusCode": 200,
  "message": "Customer viewed medicine list",
  "exception": "",
  "ipAddress": "127.0.0.1"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Log stored successfully",
  "data": {
    "logId": 1,
    "timestamp": "2026-08-02T10:30:00Z",
    "level": "INFO",
    "serviceName": "Medicine Service",
    "action": "Medicine Viewed",
    "username": "tanvi123@gmail.com",
    "userRole": "CUSTOMER",
    "endpoint": "/medicines",
    "httpMethod": "GET",
    "statusCode": 200,
    "message": "Customer viewed medicine list",
    "exception": null,
    "ipAddress": "127.0.0.1"
  }
}
```

### 2. Get All Logs
**GET** `/api/logs`

Retrieve all log entries (ordered by timestamp descending).

### 3. Get Log by ID
**GET** `/api/logs/{id}`

Retrieve a specific log entry.

### 4. Get Logs by Level
**GET** `/api/logs/level/{level}`

Filter logs by level (e.g., INFO, ERROR, WARN).

### 5. Get Logs by Service Name
**GET** `/api/logs/service/{serviceName}`

Filter logs by service name.

### 6. Get Logs by Date Range
**GET** `/api/logs/date?from={fromDate}&to={toDate}`

Filter logs by date range.

**Example**:
```
GET /api/logs/date?from=2026-08-01&to=2026-08-10
```

### 7. Delete Log
**DELETE** `/api/logs/{id}`

Delete a specific log entry.

## Integration with Spring Boot (PharmaFlow Backend)

The Spring Boot application can send logs to this service using RestTemplate or WebClient.

See [SPRING_BOOT_INTEGRATION.md](SPRING_BOOT_INTEGRATION.md) for detailed integration instructions.

### Quick Example (Spring Boot)

```java
@Service
public class LoggingClient {
    
    private final RestTemplate restTemplate;
    private final String loggingServiceUrl = "http://localhost:5000/api/logs";
    
    public void sendLog(String level, String action, String message) {
        LogRequest logRequest = new LogRequest();
        logRequest.setLevel(level);
        logRequest.setServiceName("PharmaFlow Backend");
        logRequest.setAction(action);
        logRequest.setMessage(message);
        
        restTemplate.postForEntity(loggingServiceUrl, logRequest, Void.class);
    }
}
```

## Common Log Levels

- **INFO**: General information (user login, view actions)
- **WARN**: Warning messages (validation failures)
- **ERROR**: Error messages (exceptions, failures)
- **DEBUG**: Debug information (development only)
- **FATAL**: Critical errors (system failures)

## Events to Log from Spring Boot

| Event | Level | Service Name | Action |
|-------|-------|--------------|--------|
| User Login | INFO | Auth Service | User Login |
| User Registration | INFO | Auth Service | User Registration |
| Medicine Viewed | INFO | Medicine Service | Medicine Viewed |
| Medicine Added | INFO | Medicine Service | Medicine Added |
| Cart Updated | INFO | Cart Service | Cart Updated |
| Order Placed | INFO | Order Service | Order Placed |
| Payment Success | INFO | Payment Service | Payment Success |
| Payment Failed | ERROR | Payment Service | Payment Failed |
| Exception Occurred | ERROR | Various | Exception |
| Admin Action | WARN | Admin Service | Admin Action |

## Testing with cURL

### Create a Log
```bash
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "INFO",
    "serviceName": "Medicine Service",
    "action": "Medicine Viewed",
    "username": "test@gmail.com",
    "userRole": "CUSTOMER",
    "endpoint": "/api/medicines",
    "httpMethod": "GET",
    "statusCode": 200,
    "message": "User viewed medicine list",
    "ipAddress": "127.0.0.1"
  }'
```

### Get All Logs
```bash
curl http://localhost:5000/api/logs
```

### Get Logs by Level
```bash
curl http://localhost:5000/api/logs/level/ERROR
```

## Error Handling

All errors are handled by the `GlobalExceptionMiddleware` and return a consistent response format:

```json
{
  "success": false,
  "message": "Error message here",
  "data": null
}
```

## CORS Configuration

CORS is configured to allow requests from any origin. In production, update the policy in `Program.cs`:

```csharp
policy.WithOrigins("http://localhost:8080", "http://localhost:3000")
      .AllowAnyMethod()
      .AllowAnyHeader();
```

## Running in Production

### 1. Update `appsettings.json` for Production

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-server;Database=PharmaFlowLogsDB;User Id=sa;Password=SecurePassword;TrustServerCertificate=True"
  }
}
```

### 2. Publish the Application

```bash
dotnet publish -c Release -o ./publish
```

### 3. Run as a Service

#### Windows Service
Use NSSM or install as Windows Service

#### Linux (systemd)
Create a service file: `/etc/systemd/system/pharmaflow-logging.service`

```ini
[Unit]
Description=PharmaFlow Logging Service

[Service]
WorkingDirectory=/var/www/pharmaflow-logging
ExecStart=/usr/bin/dotnet /var/www/pharmaflow-logging/PharmaFlow.LoggingService.dll
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Monitoring

Check application logs in the console output or configure file logging using Serilog.

## Troubleshooting

### Database Connection Issues
- Verify SQL Server is running
- Check connection string in `appsettings.json`
- Ensure database user has proper permissions

### Port Already in Use
Update `launchSettings.json` to use different ports.

### Migration Errors
```bash
dotnet ef database drop
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## License

This is an academic project for PharmaFlow platform.
