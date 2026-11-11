using Microsoft.AspNetCore.Http;
using backend.Services.Interfaces;

namespace backend.Services
{
    internal sealed record ValidatedUploadFile(string FileName, string Extension);

    internal static class UploadFileValidation
    {
        public static ValidatedUploadFile Validate(IFormFile file, UploadStorageCategory category)
        {
            if (file is null || file.Length == 0)
            {
                throw new UploadValidationException("Choose a non-empty file.");
            }

            if (file.Length > UploadFileStorage.MaxFileSizeBytes)
            {
                throw new UploadValidationException("Files must be 25 MB or smaller.");
            }

            var fileName = Path.GetFileName(file.FileName.Replace('\\', '/'));
            if (string.IsNullOrWhiteSpace(fileName) || fileName.Length > 255)
            {
                throw new UploadValidationException("The file name must be between 1 and 255 characters.");
            }

            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            var allowedExtensions = category switch
            {
                UploadStorageCategory.DataSources => new[] { ".csv", ".xls", ".xlsx" },
                UploadStorageCategory.Templates => new[] { ".pdf", ".docx" },
                _ => throw new ArgumentOutOfRangeException(nameof(category))
            };

            if (!allowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
            {
                var acceptedTypes = category == UploadStorageCategory.DataSources
                    ? "CSV, XLS, or XLSX"
                    : "PDF or DOCX";
                throw new UploadValidationException($"Files must be {acceptedTypes}.");
            }

            return new ValidatedUploadFile(fileName, extension);
        }
    }

    internal sealed class UploadValidationException(string message) : Exception(message);
}
