using backend.Data;
using backend.Models.Domain;
using backend.Models.DTOs.Responses;
using backend.Models.Enums;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public sealed class TemplateService : ITemplateService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IUploadFileStorage _fileStorage;
        private readonly ILogger<TemplateService> _logger;

        public TemplateService(
            ApplicationDbContext dbContext,
            IUploadFileStorage fileStorage,
            ILogger<TemplateService> logger)
        {
            _dbContext = dbContext;
            _fileStorage = fileStorage;
            _logger = logger;
        }

        public async Task<TemplateResponse?> UploadAsync(
            Guid ownerId,
            Guid projectId,
            IFormFile file,
            CancellationToken cancellationToken)
        {
            var validatedFile = UploadFileValidation.Validate(file, UploadStorageCategory.Templates);
            var ownsProject = await _dbContext.Projects
                .AnyAsync(project => project.Id == projectId && project.OwnerId == ownerId, cancellationToken);
            if (!ownsProject)
            {
                return null;
            }

            var id = Guid.NewGuid();
            var storageCategory = UploadStorageCategory.Templates;
            var filePath = await _fileStorage.SaveAsync(
                file,
                storageCategory,
                id,
                validatedFile.Extension,
                cancellationToken);

            var template = new Template
            {
                Id = id,
                TemplateName = validatedFile.FileName,
                TemplateType = validatedFile.Extension == ".pdf" ? TemplateType.Pdf : TemplateType.Docx,
                OwnerId = ownerId,
                ProjectId = projectId,
                FilePath = filePath,
                FileExtension = validatedFile.Extension,
                FileSize = file.Length,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                _dbContext.Templates.Add(template);
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
                    _logger.LogError(cleanupException, "Failed to clean up template file {TemplateId} after metadata save failed.", id);
                }

                throw;
            }

            return ToResponse(template);
        }

        public async Task<IReadOnlyList<TemplateResponse>> GetAllAsync(
            Guid ownerId,
            Guid? projectId,
            CancellationToken cancellationToken)
        {
            var query = _dbContext.Templates
                .AsNoTracking()
                .Where(template => template.OwnerId == ownerId);

            if (projectId.HasValue)
            {
                query = query.Where(template => template.ProjectId == projectId.Value);
            }

            var templates = await query
                .OrderByDescending(template => template.CreatedAt)
                .ToListAsync(cancellationToken);

            return templates.Select(ToResponse).ToArray();
        }

        public async Task<TemplateResponse?> GetByIdAsync(
            Guid ownerId,
            Guid id,
            CancellationToken cancellationToken)
        {
            var template = await _dbContext.Templates
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    item => item.Id == id && item.OwnerId == ownerId,
                    cancellationToken);

            return template is null ? null : ToResponse(template);
        }

        public async Task<StoredFileDownload?> GetFileAsync(
            Guid ownerId,
            Guid id,
            CancellationToken cancellationToken)
        {
            var template = await _dbContext.Templates
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    item => item.Id == id && item.OwnerId == ownerId,
                    cancellationToken);
            if (template is null || string.IsNullOrWhiteSpace(template.FileExtension))
            {
                return null;
            }

            var stream = _fileStorage.OpenRead(
                UploadStorageCategory.Templates,
                template.Id,
                template.FileExtension);
            if (stream is null)
            {
                _logger.LogWarning("Stored template file {TemplateId} is missing.", template.Id);
                return null;
            }

            return new StoredFileDownload(
                stream,
                template.TemplateName,
                UploadFileContentTypes.Get(template.FileExtension));
        }

        public async Task<bool> DeleteAsync(Guid ownerId, Guid id, CancellationToken cancellationToken)
        {
            var template = await _dbContext.Templates
                .FirstOrDefaultAsync(
                    item => item.Id == id && item.OwnerId == ownerId,
                    cancellationToken);
            if (template is null)
            {
                return false;
            }

            _dbContext.Templates.Remove(template);
            await _dbContext.SaveChangesAsync(cancellationToken);

            if (!string.IsNullOrWhiteSpace(template.FileExtension))
            {
                try
                {
                    _fileStorage.Delete(UploadStorageCategory.Templates, template.Id, template.FileExtension);
                }
                catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
                {
                    _logger.LogError(ex, "Template metadata {TemplateId} was deleted, but its stored file could not be removed.", id);
                    throw;
                }
            }

            return true;
        }

        private static TemplateResponse ToResponse(Template template) => new(
            template.Id,
            template.ProjectId,
            template.TemplateName,
            template.TemplateType,
            template.FileExtension ?? string.Empty,
            template.FileSize,
            new DateTimeOffset(DateTime.SpecifyKind(template.CreatedAt, DateTimeKind.Utc)));
    }
}
