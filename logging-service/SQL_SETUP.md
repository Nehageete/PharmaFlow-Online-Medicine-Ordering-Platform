# SQL Server Setup Guide

## Prerequisites

- SQL Server 2019+ or SQL Server Express
- SQL Server Management Studio (SSMS) - Optional but recommended

---

## Option 1: Automatic Migration (Recommended)

The application will automatically create the database and tables when it runs for the first time.

Just ensure SQL Server is running and the connection string is correct in `appsettings.json`.

```bash
dotnet run
```

---

## Option 2: Manual Database Creation

### Step 1: Create Database

Open SQL Server Management Studio or use `sqlcmd`:

```sql
CREATE DATABASE PharmaFlowLogsDB;
GO

USE PharmaFlowLogsDB;
GO
```

### Step 2: Create Table

```sql
CREATE TABLE Logs (
    LogId BIGINT IDENTITY(1,1) PRIMARY KEY,
    Timestamp DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Level NVARCHAR(50) NOT NULL,
    ServiceName NVARCHAR(100) NOT NULL,
    Action NVARCHAR(200) NOT NULL,
    Username NVARCHAR(100) NULL,
    UserRole NVARCHAR(50) NULL,
    Endpoint NVARCHAR(500) NULL,
    HttpMethod NVARCHAR(10) NULL,
    StatusCode INT NULL,
    Message NVARCHAR(2000) NOT NULL,
    Exception NVARCHAR(4000) NULL,
    IpAddress NVARCHAR(50) NULL
);
GO
```

### Step 3: Create Indexes

```sql
CREATE INDEX IX_Logs_Timestamp ON Logs(Timestamp);
CREATE INDEX IX_Logs_Level ON Logs(Level);
CREATE INDEX IX_Logs_ServiceName ON Logs(ServiceName);
CREATE INDEX IX_Logs_Username ON Logs(Username);
GO
```

### Step 4: Insert Sample Data (Optional)

```sql
INSERT INTO Logs (Level, ServiceName, Action, Username, UserRole, Endpoint, HttpMethod, StatusCode, Message, IpAddress)
VALUES 
('INFO', 'Auth Service', 'User Login', 'tanvi@gmail.com', 'CUSTOMER', '/api/auth/login', 'POST', 200, 'User logged in successfully', '127.0.0.1'),
('INFO', 'Medicine Service', 'Medicine Viewed', 'tanvi@gmail.com', 'CUSTOMER', '/api/medicines', 'GET', 200, 'Customer viewed medicine list', '127.0.0.1'),
('ERROR', 'Payment Service', 'Payment Failed', 'john@gmail.com', 'CUSTOMER', '/api/payments', 'POST', 500, 'Payment gateway timeout', '192.168.1.100'),
('INFO', 'Order Service', 'Order Placed', 'alice@gmail.com', 'CUSTOMER', '/api/orders', 'POST', 201, 'Order #123 placed successfully', '192.168.1.50'),
('WARN', 'Admin Service', 'User Deactivated', 'admin@pharmaflow.com', 'ADMIN', '/api/admin/users/5/deactivate', 'PATCH', 200, 'Admin deactivated user ID: 5', '127.0.0.1');
GO
```

### Step 5: Verify Data

```sql
SELECT TOP 10 * FROM Logs ORDER BY Timestamp DESC;
GO
```

---

## Option 3: Using Entity Framework Migrations

### Step 1: Install EF Core Tools

```bash
dotnet tool install --global dotnet-ef
```

### Step 2: Add Migration

```bash
cd logging-service
dotnet ef migrations add InitialCreate
```

### Step 3: Update Database

```bash
dotnet ef database update
```

This will create the database and tables automatically.

---

## Connection String Examples

### Windows Authentication (Recommended for Development)

```json
"DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
```

### SQL Server Authentication

```json
"DefaultConnection": "Server=localhost;Database=PharmaFlowLogsDB;User Id=sa;Password=YourPassword;TrustServerCertificate=True;MultipleActiveResultSets=true"
```

### Named Instance

```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=PharmaFlowLogsDB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
```

### Remote Server

```json
"DefaultConnection": "Server=192.168.1.100;Database=PharmaFlowLogsDB;User Id=pharmaflow_user;Password=SecurePassword;TrustServerCertificate=True;MultipleActiveResultSets=true"
```

---

## Verify Connection

### Using sqlcmd

```bash
sqlcmd -S localhost -d PharmaFlowLogsDB -E -Q "SELECT COUNT(*) FROM Logs"
```

### Using C# Test

Create a simple test file `TestConnection.cs`:

```csharp
using Microsoft.Data.SqlClient;

var connectionString = "Server=localhost;Database=PharmaFlowLogsDB;Trusted_Connection=True;TrustServerCertificate=True";

try
{
    using var connection = new SqlConnection(connectionString);
    connection.Open();
    Console.WriteLine("Connection successful!");
    
    using var command = new SqlCommand("SELECT COUNT(*) FROM Logs", connection);
    var count = command.ExecuteScalar();
    Console.WriteLine($"Total logs: {count}");
}
catch (Exception ex)
{
    Console.WriteLine($"Connection failed: {ex.Message}");
}
```

Run:
```bash
dotnet script TestConnection.cs
```

---

## Useful SQL Queries

### Get logs by level
```sql
SELECT * FROM Logs WHERE Level = 'ERROR' ORDER BY Timestamp DESC;
```

### Get logs by service
```sql
SELECT * FROM Logs WHERE ServiceName = 'Medicine Service' ORDER BY Timestamp DESC;
```

### Get logs by user
```sql
SELECT * FROM Logs WHERE Username = 'tanvi@gmail.com' ORDER BY Timestamp DESC;
```

### Get logs by date range
```sql
SELECT * FROM Logs 
WHERE Timestamp BETWEEN '2026-08-01' AND '2026-08-10'
ORDER BY Timestamp DESC;
```

### Count logs by level
```sql
SELECT Level, COUNT(*) as Count
FROM Logs
GROUP BY Level
ORDER BY Count DESC;
```

### Count logs by service
```sql
SELECT ServiceName, COUNT(*) as Count
FROM Logs
GROUP BY ServiceName
ORDER BY Count DESC;
```

### Recent errors
```sql
SELECT TOP 20 * 
FROM Logs 
WHERE Level = 'ERROR' 
ORDER BY Timestamp DESC;
```

### Delete old logs (cleanup)
```sql
DELETE FROM Logs WHERE Timestamp < DATEADD(day, -30, GETUTCDATE());
```

---

## Troubleshooting

### Cannot connect to SQL Server

1. Check if SQL Server service is running:
   - Open Services (services.msc)
   - Look for "SQL Server (MSSQLSERVER)" or "SQL Server (SQLEXPRESS)"
   - Ensure it's running

2. Enable TCP/IP:
   - Open SQL Server Configuration Manager
   - SQL Server Network Configuration → Protocols
   - Enable TCP/IP
   - Restart SQL Server

### Login failed for user

Ensure SQL Server Authentication is enabled:
```sql
-- Enable mixed mode authentication
-- Requires SQL Server restart
```

Or use Windows Authentication (Trusted_Connection=True)

### Database does not exist

Run:
```sql
CREATE DATABASE PharmaFlowLogsDB;
```

Or let Entity Framework create it automatically on first run.

---

## Backup and Restore

### Backup Database

```sql
BACKUP DATABASE PharmaFlowLogsDB
TO DISK = 'C:\Backup\PharmaFlowLogsDB.bak'
WITH FORMAT;
```

### Restore Database

```sql
RESTORE DATABASE PharmaFlowLogsDB
FROM DISK = 'C:\Backup\PharmaFlowLogsDB.bak'
WITH REPLACE;
```

---

## Performance Optimization

### Add additional indexes if needed

```sql
CREATE INDEX IX_Logs_StatusCode ON Logs(StatusCode);
CREATE INDEX IX_Logs_Action ON Logs(Action);
```

### Archive old logs

Create an archive table:
```sql
CREATE TABLE LogsArchive (
    -- Same structure as Logs table
);

-- Move old logs
INSERT INTO LogsArchive
SELECT * FROM Logs WHERE Timestamp < DATEADD(month, -6, GETUTCDATE());

DELETE FROM Logs WHERE Timestamp < DATEADD(month, -6, GETUTCDATE());
```

---

## Summary

1. Install SQL Server
2. Update connection string in `appsettings.json`
3. Run `dotnet ef database update` OR just run the application
4. Database and tables will be created automatically
5. Verify with sample queries

The Logging Service is now ready to receive logs from your Spring Boot application!
