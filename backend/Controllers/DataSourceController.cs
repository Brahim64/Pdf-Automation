using System.Security.Claims;
using backend.Models.DTOs.Requests;
using backend.Models.DTOs.Responses;
using backend.Services;
using backend.Services.Interfaces;
using ExcelDataReader.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    /// <summary>Uploads and manages the current user's data sources.</summary>
    [ApiController]
    [Authorize]
    [Route("api/data-sources")]
    public sealed class DataSourceController : ControllerBase
    {
        private readonly IDataSourceService _dataSourceService;
        private readonly ILogger<DataSourceController> _logger;

        public DataSourceController(
            IDataSourceService dataSourceService,
            ILogger<DataSourceController> logger)
        {
            _dataSourceService = dataSourceService;
            _logger = logger;
        }

        /// <summary>Uploads a CSV or Excel file and associates it with a project owned by the current user.</summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(UploadFileStorage.MaxRequestSizeBytes)]
        [RequestFormLimits(MultipartBodyLengthLimit = UploadFileStorage.MaxRequestSizeBytes)]
        [ProducesResponseType(typeof(DataSourceResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status413PayloadTooLarge)]
        public async Task<IActionResult> Upload(
            [FromForm] UploadDataSourceRequest request,
            CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            if (request.ProjectId == Guid.Empty)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "A valid project ID is required."
                });
            }

            try
            {
                var response = await _dataSourceService.UploadAsync(
                    ownerId,
                    request.ProjectId,
                    request.File,
                    cancellationToken);
                if (response is null)
                {
                    return NotFound(new ProblemDetails
                    {
                        Status = StatusCodes.Status404NotFound,
                        Title = "Project not found."
                    });
                }

                return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
            }
            catch (UploadValidationException ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid data source file.",
                    Detail = ex.Message
                });
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or DbUpdateException)
            {
                _logger.LogError(ex, "Failed to upload a data source for project {ProjectId}.", request.ProjectId);
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "The data source could not be uploaded.");
            }
        }

        /// <summary>Lists the current user's data sources, optionally filtered by project.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(IReadOnlyList<DataSourceResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAll(
            [FromQuery] Guid? projectId,
            CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            var dataSources = await _dataSourceService.GetAllAsync(ownerId, projectId, cancellationToken);
            return Ok(dataSources);
        }

        /// <summary>Gets metadata for one data source owned by the current user.</summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(DataSourceResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            var dataSource = await _dataSourceService.GetByIdAsync(ownerId, id, cancellationToken);
            return dataSource is null ? NotFound() : Ok(dataSource);
        }

        /// <summary>Gets column names for a data source, or generic names when its first header is not "title".</summary>
        [HttpGet("{id:guid}/columns")]
        [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetColumns(Guid id, CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            try
            {
                var columns = await _dataSourceService.GetColumnsAsync(ownerId, id, cancellationToken);
                return columns is null ? NotFound() : Ok(columns);
            }
            catch (Exception ex) when (
                ex is IOException or
                UnauthorizedAccessException or
                InvalidDataException or
                ExcelReaderException)
            {
                _logger.LogError(ex, "Failed to read columns for data source {DataSourceId}.", id);
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "The data source columns could not be read.");
            }
        }

        /// <summary>Downloads a data source owned by the current user.</summary>
        [HttpGet("{id:guid}/download")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            try
            {
                var download = await _dataSourceService.GetFileAsync(ownerId, id, cancellationToken);
                return download is null
                    ? NotFound()
                    : File(download.Stream, download.ContentType, download.FileName);
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
            {
                _logger.LogError(ex, "Failed to download data source {DataSourceId}.", id);
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "The data source could not be downloaded.");
            }
        }

        /// <summary>Deletes a data source and its stored file.</summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            try
            {
                var deleted = await _dataSourceService.DeleteAsync(ownerId, id, cancellationToken);
                return deleted ? NoContent() : NotFound();
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or DbUpdateException)
            {
                _logger.LogError(ex, "Failed to delete data source {DataSourceId}.", id);
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "The data source could not be deleted.");
            }
        }

        private bool TryGetOwnerId(out Guid ownerId)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out ownerId);
        }
    }
}
