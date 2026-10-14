using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharmaFlow.LoggingService.Entities;

public class Log
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long LogId { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }

    [Required]
    [MaxLength(50)]
    public string Level { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string ServiceName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Username { get; set; }

    [MaxLength(50)]
    public string? UserRole { get; set; }

    [MaxLength(500)]
    public string? Endpoint { get; set; }

    [MaxLength(10)]
    public string? HttpMethod { get; set; }

    public int? StatusCode { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string? Exception { get; set; }

    [MaxLength(50)]
    public string? IpAddress { get; set; }
}
