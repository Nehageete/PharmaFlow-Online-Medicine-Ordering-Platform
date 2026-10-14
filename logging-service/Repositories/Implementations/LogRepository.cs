using Microsoft.EntityFrameworkCore;
using PharmaFlow.LoggingService.Data;
using PharmaFlow.LoggingService.Entities;
using PharmaFlow.LoggingService.Repositories.Interfaces;

namespace PharmaFlow.LoggingService.Repositories.Implementations;

public class LogRepository : ILogRepository
{
    private readonly ApplicationDbContext _context;

    public LogRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Log> CreateAsync(Log log)
    {
        log.Timestamp = DateTime.UtcNow;
        await _context.Logs.AddAsync(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<Log?> GetByIdAsync(long id)
    {
        return await _context.Logs.FindAsync(id);
    }

    public async Task<IEnumerable<Log>> GetAllAsync()
    {
        return await _context.Logs
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();
    }

    public async Task<IEnumerable<Log>> GetByLevelAsync(string level)
    {
        return await _context.Logs
            .Where(l => l.Level.ToLower() == level.ToLower())
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();
    }

    public async Task<IEnumerable<Log>> GetByServiceNameAsync(string serviceName)
    {
        return await _context.Logs
            .Where(l => l.ServiceName.ToLower() == serviceName.ToLower())
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();
    }

    public async Task<IEnumerable<Log>> GetByDateRangeAsync(DateTime from, DateTime to)
    {
        return await _context.Logs
            .Where(l => l.Timestamp >= from && l.Timestamp <= to)
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var log = await _context.Logs.FindAsync(id);
        if (log == null)
        {
            return false;
        }

        _context.Logs.Remove(log);
        await _context.SaveChangesAsync();
        return true;
    }
}
