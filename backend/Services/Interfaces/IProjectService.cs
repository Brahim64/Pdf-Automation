using backend.Models.DTOs.Requests;
using backend.Models.DTOs.Responses;

namespace backend.Services.Interfaces
{
    public interface IProjectService
    {
        Task<IReadOnlyList<ProjectResponse>> GetAllAsync(Guid ownerId, CancellationToken cancellationToken);
        Task<ProjectResponse?> GetByIdAsync(Guid ownerId, Guid id, CancellationToken cancellationToken);
        Task<ProjectResponse> CreateAsync(Guid ownerId, CreateProjectRequest request, CancellationToken cancellationToken);
        Task<ProjectResponse?> UpdateAsync(Guid ownerId, Guid id, UpdateProjectRequest request, CancellationToken cancellationToken);
        Task<ProjectDeletionResult> DeleteAsync(Guid ownerId, Guid id, CancellationToken cancellationToken);
    }

    public enum ProjectDeletionResult
    {
        Deleted,
        NotFound,
        HasResources
    }
}
