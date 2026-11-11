using backend.Data;
using backend.Models.Domain;
using backend.Models.DTOs.Responses;
using backend.Models.Enums;
using backend.Services.Interfaces;
using ExcelDataReader;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;

namespace backend.Services
{
    public sealed class DataSourceService : IDataSourceService
    {
        static DataSourceService()
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        }

        private readonly ApplicationDbContext _dbContext;
        private readonly IUploadFileStorage _fileStorage;
        private readonly ILogger<DataSourceService> _logger;

        public DataSourceService(
            ApplicationDbContext dbContext,
            IUploadFileStorage fileStorage,
            ILogger<DataSourceService> logger)
        {
            _dbContext = dbContext;
            _fileStorage = fileStorage;
            _logger = logger;
        }

        public async Task<DataSourceResponse?> UploadAsync(
            Guid ownerId,
            Guid projectId,
            IFormFile file,
            CancellationToken cancellationToken)
        {
            var validatedFile = UploadFileValidation.Validate(file, UploadStorageCategory.DataSources);
            var ownsProject = await _dbContext.Projects
                .AnyAsync(project => project.Id == projectId && project.OwnerId == ownerId, cancellationToken);
            if (!ownsProject)
            {
                return null;
            }

            var id = Guid.NewGuid();
            var storageCategory = UploadStorageCategory.DataSources;
            var filePath = await _fileStorage.SaveAsync(
                file,
                storageCategory,
                id,
                validatedFile.Extension,
                cancellationToken);

            var dataFile = new DataFile
            {
                Id = id,
                DataFileName = validatedFile.FileName,
                DataFileType = validatedFile.Extension == ".csv" ? DataFileType.Csv : DataFileType.Excel,
                OwnerId = ownerId,
                ProjectId = projectId,
                FilePath = filePath,
                FileExtension = validatedFile.Extension,
                FileSize = file.Length,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                _dbContext.DataFiles.Add(dataFile);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
            catch
            {
                try
                {
                    _fileStorage.Delete(storageCategory, id, validatedFile.Extension);
                }
                catch (Exception cleanupException) when (cleanupException is IOException or UnauthorizedAccessException)
                {
                    _logger.LogError(cleanupException, "Failed to clean up data source file {DataSourceId} after metadata save failed.", id);
                }

                throw;
            }

            return ToResponse(dataFile);
        }

        public async Task<IReadOnlyList<DataSourceResponse>> GetAllAsync(
            Guid ownerId,
            Guid? projectId,
            CancellationToken cancellationToken)
        {
            var query = _dbContext.DataFiles
                .AsNoTracking()
                .Where(dataFile => dataFile.OwnerId == ownerId);

            if (projectId.HasValue)
            {
                query = query.Where(dataFile => dataFile.ProjectId == projectId.Value);
            }

            var dataFiles = await query
                .OrderByDescending(dataFile => dataFile.CreatedAt)
                .ToListAsync(cancellationToken);

            return dataFiles.Select(ToResponse).ToArray();
        }

        public async Task<DataSourceResponse?> GetByIdAsync(
            Guid ownerId,
            Guid id,
            CancellationToken cancellationToken)
        {
            var dataFile = await _dbContext.DataFiles
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    item => item.Id == id && item.OwnerId == ownerId,
                    cancellationToken);

            return dataFile is null ? null : ToResponse(dataFile);
        }

        public async Task<IReadOnlyList<string>?> GetColumnsAsync(
            Guid ownerId,
            Guid id,
            CancellationToken cancellationToken)
        {
            var dataFile = await _dbContext.DataFiles
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    item => item.Id == id && item.OwnerId == ownerId,
                    cancellationToken);
            if (dataFile is null || string.IsNullOrWhiteSpace(dataFile.FileExtension))
            {
                return null;
            }

            var stream = _fileStorage.OpenRead(
                UploadStorageCategory.DataSources,
                dataFile.Id,
                dataFile.FileExtension);
            if (stream is null)
            {
                _logger.LogWarning("Stored data source file {DataSourceId} is missing.", dataFile.Id);
                return null;
            }

            using (stream)
            using (var reader = dataFile.FileExtension.Equals(".csv", StringComparison.OrdinalIgnoreCase)
                ? ExcelReaderFactory.CreateCsvReader(stream, new ExcelReaderConfiguration
                {
                    AutodetectSeparators = [',', ';', '\t', '|'],
                    FallbackEncoding = Encoding.UTF8
                })
                : ExcelReaderFactory.CreateReader(stream))
            {
                cancellationToken.ThrowIfCancellationRequested();
                if (!reader.Read())
                {
                    return Array.Empty<string>();
                }

                var headers = Enumerable.Range(0, reader.FieldCount)
                    .Select(index => Convert.ToString(reader.GetValue(index), CultureInfo.InvariantCulture)?.Trim() ?? string.Empty)
                    .ToArray();

                if (headers.Length > 0 && string.Equals(headers[0], "title", StringComparison.OrdinalIgnoreCase))
                {
                    return headers;
                }

                return Enumerable.Range(1, headers.Length)
                    .Select(index => $"Column {index}")
                    .ToArray();
            }
        }

        public async Task<StoredFileDownload?> GetFileAsync(
            Guid ownerId,
            Guid id,
            CancellationToken cancellationToken)
        {
            var dataFile = await _dbContext.DataFiles
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    item => item.Id == id && item.OwnerId == ownerId,
                    cancellationToken);
            if (dataFile is null || string.IsNullOrWhiteSpace(dataFile.FileExtension))
            {
                return null;
            }

            var stream = _fileStorage.OpenRead(
                UploadStorageCategory.DataSources,
                dataFile.Id,
                dataFile.FileExtension);
            if (stream is null)
            {
                _logger.LogWarning("Stored data source file {DataSourceId} is missing.", dataFile.Id);
                return null;
            }

            return new StoredFileDownload(
                stream,
                dataFile.DataFileName,
                UploadFileContentTypes.Get(dataFile.FileExtension));
        }

        public async Task<bool> DeleteAsync(Guid ownerId, Guid id, CancellationToken cancellationToken)
        {
            var dataFile = await _dbContext.DataFiles
                .FirstOrDefaultAsync(
                    item => item.Id == id && item.OwnerId == ownerId,
                    cancellationToken);
            if (dataFile is null)
            {
                return false;
            }

            _dbContext.DataFiles.Remove(dataFile);
            await _dbContext.SaveChangesAsync(cancellationToken);

            if (!string.IsNullOrWhiteSpace(dataFile.FileExtension))
            {
                try
                {
                    _fileStorage.Delete(UploadStorageCategory.DataSources, dataFile.Id, dataFile.FileExtension);
                }
                catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
                {
                    _logger.LogError(ex, "Data source metadata {DataSourceId} was deleted, but its stored file could not be removed.", id);
                    throw;
                }
            }

            return true;
        }

        private static DataSourceResponse ToResponse(DataFile dataFile) => new(
            dataFile.Id,
            dataFile.ProjectId,
            dataFile.DataFileName,
            dataFile.DataFileType,
            dataFile.FileExtension ?? string.Empty,
            dataFile.FileSize,
            new DateTimeOffset(DateTime.SpecifyKind(dataFile.CreatedAt, DateTimeKind.Utc)));
    }
}
