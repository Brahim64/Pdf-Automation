using backend.Models.Enums;

namespace backend.Models.DTOs.Responses
{
    /// <summary>Metadata for an uploaded data source.</summary>
    public sealed record DataSourceResponse(
        Guid Id,
        Guid ProjectId,
        string FileName,
        DataFileType DataFileType,
        string FileExtension,
        long FileSize,
        DateTimeOffset CreatedAt);
}
