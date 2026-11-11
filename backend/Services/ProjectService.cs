using backend.Data;
using backend.Models.Domain;
using backend.Models.DTOs.Requests;
using backend.Models.DTOs.Responses;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public sealed class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _dbContext;

        public ProjectService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IReadOnlyList<ProjectResponse>> GetAllAsync(
            Guid ownerId,
            CancellationToken cancellationToken)
        {
            var projects = await _dbContext.Projects
                .AsNoTracking()
                .Where(project => project.OwnerId == ownerId)
                .OrderByDescending(project => project.CreatedAt)
                .ToListAsync(cancellationToken);

            return projects.Select(ToResponse).ToArray();
        }

        public async Task<ProjectResponse?> GetByIdAsync(
            Guid ownerId,
            Guid id,
            CancellationToken cancellationToken)
        {
            var project = await _dbContext.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    item => item.Id == id && item.OwnerId == ownerId,
                    cancellationToken);

            return project is null ? null : ToResponse(project);
        }

        public async Task<ProjectResponse> CreateAsync(
            Guid ownerId,
            CreateProjectRequest request,
            CancellationToken cancellationToken)
        {
            var project = new Project
            {
                Name = request.Name,
                Description = request.Description,
                OwnerId = ownerId,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Projects.Add(project);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return ToResponse(project);
        }

        public async Task<ProjectResponse?> UpdateAsync(
            Guid ownerId,
            Guid id,
            UpdateProjectRequest request,
            CancellationToken cancellationToken)
        {
            var project = await _dbContext.Projects
                .FirstOrDefaultAsync(
                    item => item.Id == id && item.OwnerId == ownerId,
                    cancellationToken);
            if (project is null)
            {
                return null;
            }

            project.Name = request.Name;
            project.Description = request.Description;
            project.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);

            return ToResponse(project);
        }

        public async Task<ProjectDeletionResult> DeleteAsync(
            Guid ownerId,
            Guid id,
            CancellationToken cancellationToken)
        {
            var project = await _dbContext.Projects
                .FirstOrDefaultAsync(
                    item => item.Id == id && item.OwnerId == ownerId,
                    cancellationToken);
            if (project is null)
            {
                return ProjectDeletionResult.NotFound;
            }

            var hasResources =
                await _dbContext.Templates.AnyAsync(item => item.ProjectId == id, cancellationToken) ||
                await _dbContext.DataFiles.AnyAsync(item => item.ProjectId == id, cancellationToken) ||
                await _dbContext.PdfResults.AnyAsync(item => item.ProjectId == id, cancellationToken);
            if (hasResources)
            {
                return ProjectDeletionResult.HasResources;
            }

            _dbContext.Projects.Remove(project);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return ProjectDeletionResult.Deleted;
        }

        private static ProjectResponse ToResponse(Project project) => new(
            project.Id,
            project.Id,
            project.Name,
            project.Description,
            project.OwnerId,
            new DateTimeOffset(DateTime.SpecifyKind(project.CreatedAt, DateTimeKind.Utc)),
            project.UpdatedAt.HasValue
                ? new DateTimeOffset(DateTime.SpecifyKind(project.UpdatedAt.Value, DateTimeKind.Utc))
                : null);
    }
}
