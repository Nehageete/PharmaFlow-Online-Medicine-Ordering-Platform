namespace PharmaFlow.LoggingService.DTOs;

public class LogResponseDto
{
    public long LogId { get; set; }
    public DateTime Timestamp { get; set; }
    public string Level { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Username { get; set; }
    public string? UserRole { get; set; }
    public string? Endpoint { get; set; }
    public string? HttpMethod { get; set; }
    public int? StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Exception { get; set; }
    public string? IpAddress { get; set; }
}
