using System.Security.Claims;
using backend.Models.DTOs.Requests;
using backend.Models.DTOs.Responses;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>Creates and manages projects owned by the current user.</summary>
    [ApiController]
    [Authorize]
    [Route("api/projects")]
    public sealed class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        /// <summary>Lists all projects owned by the current user.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(IReadOnlyList<ProjectResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            var projects = await _projectService.GetAllAsync(ownerId, cancellationToken);
            return Ok(projects);
        }

        /// <summary>Gets a project owned by the current user.</summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            var project = await _projectService.GetByIdAsync(ownerId, id, cancellationToken);
            return project is null ? NotFound() : Ok(project);
        }

        /// <summary>Creates a project for the current user.</summary>
        [HttpPost]
        [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Create(
            [FromBody] CreateProjectRequest request,
            CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            var project = await _projectService.CreateAsync(ownerId, request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
        }

        /// <summary>Updates a project owned by the current user.</summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(
            Guid id,
            [FromBody] UpdateProjectRequest request,
            CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            var project = await _projectService.UpdateAsync(ownerId, id, request, cancellationToken);
            return project is null ? NotFound() : Ok(project);
        }

        /// <summary>Deletes an empty project owned by the current user.</summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            if (!TryGetOwnerId(out var ownerId))
            {
                return Unauthorized();
            }

            var result = await _projectService.DeleteAsync(ownerId, id, cancellationToken);
            return result switch
            {
                ProjectDeletionResult.Deleted => NoContent(),
                ProjectDeletionResult.NotFound => NotFound(),
                ProjectDeletionResult.HasResources => Conflict(new ProblemDetails
                {
                    Status = StatusCodes.Status409Conflict,
                    Title = "The project cannot be deleted while it contains templates, data sources, or PDF results."
                }),
                _ => throw new InvalidOperationException("The project deletion result is not supported.")
            };
        }

        private bool TryGetOwnerId(out Guid ownerId)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out ownerId);
        }
    }
}
