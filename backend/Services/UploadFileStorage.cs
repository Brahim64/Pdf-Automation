using backend.Services.Interfaces;

namespace backend.Services
{
    public sealed class UploadFileStorage : IUploadFileStorage
    {
        public const long MaxFileSizeBytes = 25 * 1024 * 1024;
        public const long MaxRequestSizeBytes = 26 * 1024 * 1024;

        private readonly string _contentRootPath;

        public UploadFileStorage(IWebHostEnvironment environment)
        {
            _contentRootPath = environment.ContentRootPath;
        }

        public async Task<string> SaveAsync(
            IFormFile file,
            UploadStorageCategory category,
            Guid id,
            string extension,
            CancellationToken cancellationToken)
        {
            var directory = GetDirectory(category);
            ValidateExtension(category, extension);

            var storageDirectory = Path.Combine(_contentRootPath, "Storage", directory);
            var targetPath = Path.Combine(storageDirectory, $"{id:N}{extension}");
            var temporaryPath = Path.Combine(storageDirectory, $"{id:N}.tmp");

            Directory.CreateDirectory(storageDirectory);

            try
            {
                await using (var stream = new FileStream(
                    temporaryPath,
                    FileMode.CreateNew,
                    FileAccess.Write,
                    FileShare.None,
                    bufferSize: 81920,
                    useAsync: true))
                {
                    await file.CopyToAsync(stream, cancellationToken);
                }

                File.Move(temporaryPath, targetPath);
            }
            finally
            {
                if (File.Exists(temporaryPath))
                {
                    File.Delete(temporaryPath);
                }
            }

            return $"Storage/{directory}/{id:N}{extension}";
        }

        public FileStream? OpenRead(UploadStorageCategory category, Guid id, string extension)
        {
            ValidateExtension(category, extension);
            var path = GetFilePath(category, id, extension);
            if (!File.Exists(path))
            {
                return null;
            }

            return new FileStream(
                path,
                FileMode.Open,
                FileAccess.Read,
                FileShare.Read,
                bufferSize: 81920,
                useAsync: true);
        }

        public void Delete(UploadStorageCategory category, Guid id, string extension)
        {
            ValidateExtension(category, extension);
            var path = GetFilePath(category, id, extension);
            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }

        private string GetFilePath(UploadStorageCategory category, Guid id, string extension)
        {
            var directory = GetDirectory(category);
            return Path.Combine(_contentRootPath, "Storage", directory, $"{id:N}{extension}");
        }

        private static string GetDirectory(UploadStorageCategory category) => category switch
        {
            UploadStorageCategory.DataSources => "DataSources",
            UploadStorageCategory.Templates => "Templates",
            _ => throw new ArgumentOutOfRangeException(nameof(category))
        };

        private static void ValidateExtension(UploadStorageCategory category, string extension)
        {
            var allowedExtensions = category switch
            {
                UploadStorageCategory.DataSources => new[] { ".csv", ".xls", ".xlsx" },
                UploadStorageCategory.Templates => new[] { ".pdf", ".docx" },
                _ => throw new ArgumentOutOfRangeException(nameof(category))
            };

            if (!allowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException("The file extension is not supported for this upload category.", nameof(extension));
            }
        }
    }
}
