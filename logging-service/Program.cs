using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using PharmaFlow.LoggingService.Data;
using PharmaFlow.LoggingService.Middleware;
using PharmaFlow.LoggingService.Repositories.Implementations;
using PharmaFlow.LoggingService.Repositories.Interfaces;
using PharmaFlow.LoggingService.Services.Implementations;
using PharmaFlow.LoggingService.Services.Interfaces;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configure MySQL Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Port=3306;Database=PharmaFlow;User=root;Password=tad@123;";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Register Repository
builder.Services.AddScoped<ILogRepository, LogRepository>();

// Register Service
builder.Services.AddScoped<ILogService, LogService>();

// Configure CORS (for Spring Boot integration)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PharmaFlow Logging Service API",
        Version = "v1",
        Description = "Logging Microservice for PharmaFlow E-commerce Platform",
        Contact = new OpenApiContact
        {
            Name = "PharmaFlow Team",
            Email = "support@pharmaflow.com"
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PharmaFlow Logging Service v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at app root
    });
}

// Global Exception Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// Ensure MySQL database table is created
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        const string createTableSql = @"
            CREATE TABLE IF NOT EXISTS `Logs` (
                `LogId` BIGINT AUTO_INCREMENT PRIMARY KEY,
                `Timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                `Level` VARCHAR(50) NOT NULL,
                `ServiceName` VARCHAR(100) NOT NULL,
                `Action` VARCHAR(200) NOT NULL,
                `Username` VARCHAR(100) NULL,
                `UserRole` VARCHAR(50) NULL,
                `Endpoint` VARCHAR(500) NULL,
                `HttpMethod` VARCHAR(10) NULL,
                `StatusCode` INT NULL,
                `Message` VARCHAR(2000) NOT NULL,
                `Exception` VARCHAR(4000) NULL,
                `IpAddress` VARCHAR(50) NULL,
                INDEX `IX_Logs_Timestamp` (`Timestamp`),
                INDEX `IX_Logs_Level` (`Level`),
                INDEX `IX_Logs_ServiceName` (`ServiceName`),
                INDEX `IX_Logs_Username` (`Username`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        dbContext.Database.ExecuteSqlRaw(createTableSql);
        Console.WriteLine("MySQL Logs table verified/created successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization warning: {ex.Message}");
    }
}

app.Run();
