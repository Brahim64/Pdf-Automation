using backend.Models.DTOs.Responses;
using Microsoft.AspNetCore.Http;

namespace backend.Services.Interfaces
{
    public interface IDataSourceService
    {
        Task<DataSourceResponse?> UploadAsync(Guid ownerId, Guid projectId, IFormFile file, CancellationToken cancellationToken);
        Task<IReadOnlyList<DataSourceResponse>> GetAllAsync(Guid ownerId, Guid? projectId, CancellationToken cancellationToken);
        Task<DataSourceResponse?> GetByIdAsync(Guid ownerId, Guid id, CancellationToken cancellationToken);
        Task<IReadOnlyList<string>?> GetColumnsAsync(Guid ownerId, Guid id, CancellationToken cancellationToken);
        Task<StoredFileDownload?> GetFileAsync(Guid ownerId, Guid id, CancellationToken cancellationToken);
        Task<bool> DeleteAsync(Guid ownerId, Guid id, CancellationToken cancellationToken);
    }
}
