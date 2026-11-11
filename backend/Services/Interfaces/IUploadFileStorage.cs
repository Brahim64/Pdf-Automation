using Microsoft.AspNetCore.Http;

namespace backend.Services.Interfaces
{
    public enum UploadStorageCategory
    {
        DataSources,
        Templates
    }

    public interface IUploadFileStorage
    {
        Task<string> SaveAsync(
            IFormFile file,
            UploadStorageCategory category,
            Guid id,
            string extension,
            CancellationToken cancellationToken);

        FileStream? OpenRead(UploadStorageCategory category, Guid id, string extension);
        void Delete(UploadStorageCategory category, Guid id, string extension);
    }
}
