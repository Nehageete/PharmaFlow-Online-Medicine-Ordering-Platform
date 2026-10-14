using PharmaFlow.LoggingService.DTOs;

namespace PharmaFlow.LoggingService.Services.Interfaces;

public interface ILogService
{
    Task<LogResponseDto> CreateLogAsync(CreateLogDto createLogDto);
    Task<LogResponseDto?> GetLogByIdAsync(long id);
    Task<IEnumerable<LogResponseDto>> GetAllLogsAsync();
    Task<IEnumerable<LogResponseDto>> GetLogsByLevelAsync(string level);
    Task<IEnumerable<LogResponseDto>> GetLogsByServiceNameAsync(string serviceName);
    Task<IEnumerable<LogResponseDto>> GetLogsByDateRangeAsync(DateTime from, DateTime to);
    Task<bool> DeleteLogAsync(long id);
}
