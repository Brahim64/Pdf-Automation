using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs.Requests
{
    /// <summary>Payload for creating a project.</summary>
    public sealed record CreateProjectRequest
    {
        [Required]
        [MaxLength(255)]
        public required string Name { get; init; }

        [MaxLength(1000)]
        public string? Description { get; init; }
    }
}
