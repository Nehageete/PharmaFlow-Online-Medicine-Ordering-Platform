using System.ComponentModel.DataAnnotations;

namespace PharmaFlow.LoggingService.DTOs;

public class CreateLogDto
{
    [Required(ErrorMessage = "Level is required")]
    [MaxLength(50, ErrorMessage = "Level cannot exceed 50 characters")]
    public string Level { get; set; } = string.Empty;

    [Required(ErrorMessage = "ServiceName is required")]
    [MaxLength(100, ErrorMessage = "ServiceName cannot exceed 100 characters")]
    public string ServiceName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Action is required")]
    [MaxLength(200, ErrorMessage = "Action cannot exceed 200 characters")]
    public string Action { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "Username cannot exceed 100 characters")]
    public string? Username { get; set; }

    [MaxLength(50, ErrorMessage = "UserRole cannot exceed 50 characters")]
    public string? UserRole { get; set; }

    [MaxLength(500, ErrorMessage = "Endpoint cannot exceed 500 characters")]
    public string? Endpoint { get; set; }

    [MaxLength(10, ErrorMessage = "HttpMethod cannot exceed 10 characters")]
    public string? HttpMethod { get; set; }

    [Range(100, 599, ErrorMessage = "StatusCode must be between 100 and 599")]
    public int? StatusCode { get; set; }

    [Required(ErrorMessage = "Message is required")]
    [MaxLength(2000, ErrorMessage = "Message cannot exceed 2000 characters")]
    public string Message { get; set; } = string.Empty;

    [MaxLength(4000, ErrorMessage = "Exception cannot exceed 4000 characters")]
    public string? Exception { get; set; }

    [MaxLength(50, ErrorMessage = "IpAddress cannot exceed 50 characters")]
    public string? IpAddress { get; set; }
}
