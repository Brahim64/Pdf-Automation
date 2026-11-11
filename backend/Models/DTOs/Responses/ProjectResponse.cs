namespace backend.Models.DTOs.Responses
{
    /// <summary>Project details returned by the API.</summary>
    public sealed record ProjectResponse(
        Guid Id,
        Guid ProjectId,
        string Name,
        string? Description,
        Guid OwnerId,
        DateTimeOffset CreatedAt,
        DateTimeOffset? UpdatedAt);
}
