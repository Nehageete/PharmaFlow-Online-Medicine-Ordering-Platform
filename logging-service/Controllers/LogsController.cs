using Microsoft.AspNetCore.Mvc;
using PharmaFlow.LoggingService.DTOs;
using PharmaFlow.LoggingService.Models;
using PharmaFlow.LoggingService.Services.Interfaces;

namespace PharmaFlow.LoggingService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LogsController : ControllerBase
{
    private readonly ILogService _logService;
    private readonly ILogger<LogsController> _logger;

    public LogsController(ILogService logService, ILogger<LogsController> logger)
    {
        _logService = logService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new log entry
    /// </summary>
    /// <param name="createLogDto">Log data</param>
    /// <returns>Created log entry</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LogResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<LogResponseDto>>> CreateLog([FromBody] CreateLogDto createLogDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Validation failed"));
        }

        var log = await _logService.CreateLogAsync(createLogDto);
        _logger.LogInformation("Log entry created with ID: {LogId}", log.LogId);

        return CreatedAtAction(
            nameof(GetLogById),
            new { id = log.LogId },
            ApiResponse<LogResponseDto>.SuccessResponse("Log stored successfully", log)
        );
    }

    /// <summary>
    /// Get a log entry by ID
    /// </summary>
    /// <param name="id">Log ID</param>
    /// <returns>Log entry</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<LogResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<LogResponseDto>>> GetLogById(long id)
    {
        var log = await _logService.GetLogByIdAsync(id);

        if (log == null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse($"Log with ID {id} not found"));
        }

        return Ok(ApiResponse<LogResponseDto>.SuccessResponse("Log retrieved successfully", log));
    }

    /// <summary>
    /// Get all log entries
    /// </summary>
    /// <returns>List of all logs</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LogResponseDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<LogResponseDto>>>> GetAllLogs()
    {
        var logs = await _logService.GetAllLogsAsync();
        return Ok(ApiResponse<IEnumerable<LogResponseDto>>.SuccessResponse("Logs retrieved successfully", logs));
    }

    /// <summary>
    /// Get logs filtered by level
    /// </summary>
    /// <param name="level">Log level (e.g., INFO, ERROR, WARN)</param>
    /// <returns>Filtered logs</returns>
    [HttpGet("level/{level}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LogResponseDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<LogResponseDto>>>> GetLogsByLevel(string level)
    {
        var logs = await _logService.GetLogsByLevelAsync(level);
        return Ok(ApiResponse<IEnumerable<LogResponseDto>>.SuccessResponse($"Logs with level '{level}' retrieved successfully", logs));
    }

    /// <summary>
    /// Get logs filtered by service name
    /// </summary>
    /// <param name="serviceName">Service name</param>
    /// <returns>Filtered logs</returns>
    [HttpGet("service/{serviceName}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LogResponseDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<LogResponseDto>>>> GetLogsByServiceName(string serviceName)
    {
        var logs = await _logService.GetLogsByServiceNameAsync(serviceName);
        return Ok(ApiResponse<IEnumerable<LogResponseDto>>.SuccessResponse($"Logs for service '{serviceName}' retrieved successfully", logs));
    }

    /// <summary>
    /// Get logs filtered by date range
    /// </summary>
    /// <param name="from">Start date</param>
    /// <param name="to">End date</param>
    /// <returns>Filtered logs</returns>
    [HttpGet("date")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LogResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<IEnumerable<LogResponseDto>>>> GetLogsByDateRange(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        if (from > to)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("'from' date must be before 'to' date"));
        }

        var logs = await _logService.GetLogsByDateRangeAsync(from, to);
        return Ok(ApiResponse<IEnumerable<LogResponseDto>>.SuccessResponse("Logs retrieved successfully", logs));
    }

    /// <summary>
    /// Delete a log entry
    /// </summary>
    /// <param name="id">Log ID</param>
    /// <returns>Success confirmation</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> DeleteLog(long id)
    {
        var deleted = await _logService.DeleteLogAsync(id);

        if (!deleted)
        {
            return NotFound(ApiResponse<object>.ErrorResponse($"Log with ID {id} not found"));
        }

        _logger.LogInformation("Log entry deleted with ID: {LogId}", id);
        return Ok(ApiResponse<object>.SuccessResponse("Log deleted successfully", null));
    }
}
