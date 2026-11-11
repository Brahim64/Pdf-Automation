using System.Security.Claims;
using backend.Models.DTOs.Requests;
using backend.Models.DTOs.Responses;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    /// <summary>Uploads and manages the current user's templates.</summary>
    [ApiController]
    [Authorize]
    [Route("api/templates")]
    public sealed class TemplateController : ControllerBase
    {
        private readonly ITemplateService _templateService;
        private readonly ILogger<TemplateController> _logger;

        public TemplateController(
            ITemplateService templateService,
            ILogger<TemplateController> logger)
        {
            _templateService = templateService;
            _logger = logger;
        }

        /// <summary>Uploads a PDF or DOCX template and associates it with a project owned by the current user.</summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(UploadFileStorage.MaxRequestSizeBytes)]
        [RequestFormLimits(MultipartBodyLengthLimit = UploadFileStorage.MaxRequestSizeBytes)]
        [ProducesResponseType(typeof(TemplateResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status413PayloadTooLarge)]
        public async Task<IActionResult> Upload(
            [FromForm] UploadTemplateRequest request,
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
                var response = await _templateService.UploadAsync(
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
                    Title = "Invalid template file.",
                    Detail = ex.Message
                });
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or DbUpdateException)
            {
                _logger.LogError(ex, "Failed to upload a template for project {ProjectId}.", request.ProjectId);
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "The template could not be uploaded.");
            }
        }

        /// <summary>Lists the current user's templates, optionally filtered by project.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(IReadOnlyList<TemplateResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAll(
            [FromQuery] Guid? projectId,
            CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            var templates = await _templateService.GetAllAsync(ownerId, projectId, cancellationToken);
            return Ok(templates);
        }

        /// <summary>Gets metadata for one template owned by the current user.</summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(TemplateResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            var template = await _templateService.GetByIdAsync(ownerId, id, cancellationToken);
            return template is null ? NotFound() : Ok(template);
        }

        /// <summary>Downloads a template owned by the current user.</summary>
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
                var download = await _templateService.GetFileAsync(ownerId, id, cancellationToken);
                return download is null
                    ? NotFound()
                    : File(download.Stream, download.ContentType, download.FileName);
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
            {
                _logger.LogError(ex, "Failed to download template {TemplateId}.", id);
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "The template could not be downloaded.");
            }
        }

        /// <summary>Deletes a template and its stored file.</summary>
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
                var deleted = await _templateService.DeleteAsync(ownerId, id, cancellationToken);
                return deleted ? NoContent() : NotFound();
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or DbUpdateException)
            {
                _logger.LogError(ex, "Failed to delete template {TemplateId}.", id);
                return Problem(
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "The template could not be deleted.");
            }
        }

        private bool TryGetOwnerId(out Guid ownerId)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out ownerId);
        }
    }
}
