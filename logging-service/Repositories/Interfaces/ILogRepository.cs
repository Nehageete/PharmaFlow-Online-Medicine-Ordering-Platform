using PharmaFlow.LoggingService.Entities;

namespace PharmaFlow.LoggingService.Repositories.Interfaces;

public interface ILogRepository
{
    Task<Log> CreateAsync(Log log);
    Task<Log?> GetByIdAsync(long id);
    Task<IEnumerable<Log>> GetAllAsync();
    Task<IEnumerable<Log>> GetByLevelAsync(string level);
    Task<IEnumerable<Log>> GetByServiceNameAsync(string serviceName);
    Task<IEnumerable<Log>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<bool> DeleteAsync(long id);
}
