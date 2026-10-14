using PharmaFlow.LoggingService.DTOs;
using PharmaFlow.LoggingService.Entities;
using PharmaFlow.LoggingService.Repositories.Interfaces;
using PharmaFlow.LoggingService.Services.Interfaces;

namespace PharmaFlow.LoggingService.Services.Implementations;

public class LogService : ILogService
{
    private readonly ILogRepository _logRepository;

    public LogService(ILogRepository logRepository)
    {
        _logRepository = logRepository;
    }

    public async Task<LogResponseDto> CreateLogAsync(CreateLogDto createLogDto)
    {
        var log = new Log
        {
            Level = createLogDto.Level,
            ServiceName = createLogDto.ServiceName,
            Action = createLogDto.Action,
            Username = createLogDto.Username,
            UserRole = createLogDto.UserRole,
            Endpoint = createLogDto.Endpoint,
            HttpMethod = createLogDto.HttpMethod,
            StatusCode = createLogDto.StatusCode,
            Message = createLogDto.Message,
            Exception = createLogDto.Exception,
            IpAddress = createLogDto.IpAddress
        };

        var createdLog = await _logRepository.CreateAsync(log);
        return MapToResponseDto(createdLog);
    }

    public async Task<LogResponseDto?> GetLogByIdAsync(long id)
    {
        var log = await _logRepository.GetByIdAsync(id);
        return log == null ? null : MapToResponseDto(log);
    }

    public async Task<IEnumerable<LogResponseDto>> GetAllLogsAsync()
    {
        var logs = await _logRepository.GetAllAsync();
        return logs.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<LogResponseDto>> GetLogsByLevelAsync(string level)
    {
        var logs = await _logRepository.GetByLevelAsync(level);
        return logs.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<LogResponseDto>> GetLogsByServiceNameAsync(string serviceName)
    {
        var logs = await _logRepository.GetByServiceNameAsync(serviceName);
        return logs.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<LogResponseDto>> GetLogsByDateRangeAsync(DateTime from, DateTime to)
    {
        var logs = await _logRepository.GetByDateRangeAsync(from, to);
        return logs.Select(MapToResponseDto);
    }

    public async Task<bool> DeleteLogAsync(long id)
    {
        return await _logRepository.DeleteAsync(id);
    }

    private static LogResponseDto MapToResponseDto(Log log)
    {
        return new LogResponseDto
        {
            LogId = log.LogId,
            Timestamp = log.Timestamp,
            Level = log.Level,
            ServiceName = log.ServiceName,
            Action = log.Action,
            Username = log.Username,
            UserRole = log.UserRole,
            Endpoint = log.Endpoint,
            HttpMethod = log.HttpMethod,
            StatusCode = log.StatusCode,
            Message = log.Message,
            Exception = log.Exception,
            IpAddress = log.IpAddress
        };
    }
}
