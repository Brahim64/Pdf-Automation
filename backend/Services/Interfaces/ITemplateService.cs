using backend.Models.DTOs.Responses;
using Microsoft.AspNetCore.Http;

namespace backend.Services.Interfaces
{
    public interface ITemplateService
    {
        Task<TemplateResponse?> UploadAsync(Guid ownerId, Guid projectId, IFormFile file, CancellationToken cancellationToken);
        Task<IReadOnlyList<TemplateResponse>> GetAllAsync(Guid ownerId, Guid? projectId, CancellationToken cancellationToken);
        Task<TemplateResponse?> GetByIdAsync(Guid ownerId, Guid id, CancellationToken cancellationToken);
        Task<StoredFileDownload?> GetFileAsync(Guid ownerId, Guid id, CancellationToken cancellationToken);
        Task<bool> DeleteAsync(Guid ownerId, Guid id, CancellationToken cancellationToken);
    }
}
