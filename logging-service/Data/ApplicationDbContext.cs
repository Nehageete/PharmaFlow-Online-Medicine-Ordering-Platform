using Microsoft.EntityFrameworkCore;
using PharmaFlow.LoggingService.Entities;

namespace PharmaFlow.LoggingService.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Log> Logs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Log>(entity =>
        {
            entity.ToTable("Logs");

            entity.HasKey(e => e.LogId);

            entity.Property(e => e.LogId)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Timestamp)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

            entity.Property(e => e.Level)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.ServiceName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Action)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Username)
                .HasMaxLength(100);

            entity.Property(e => e.UserRole)
                .HasMaxLength(50);

            entity.Property(e => e.Endpoint)
                .HasMaxLength(500);

            entity.Property(e => e.HttpMethod)
                .HasMaxLength(10);

            entity.Property(e => e.Message)
                .IsRequired()
                .HasMaxLength(2000);

            entity.Property(e => e.Exception)
                .HasMaxLength(4000);

            entity.Property(e => e.IpAddress)
                .HasMaxLength(50);

            entity.HasIndex(e => e.Timestamp)
                .HasDatabaseName("IX_Logs_Timestamp");

            entity.HasIndex(e => e.Level)
                .HasDatabaseName("IX_Logs_Level");

            entity.HasIndex(e => e.ServiceName)
                .HasDatabaseName("IX_Logs_ServiceName");

            entity.HasIndex(e => e.Username)
                .HasDatabaseName("IX_Logs_Username");
        });
    }
}
