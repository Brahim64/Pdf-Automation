using backend.Models.Enums;

namespace backend.Models.DTOs.Responses
{
    /// <summary>Metadata for an uploaded template.</summary>
    public sealed record TemplateResponse(
        Guid Id,
        Guid ProjectId,
        string FileName,
        TemplateType TemplateType,
        string FileExtension,
        long FileSize,
        DateTimeOffset CreatedAt);
}
