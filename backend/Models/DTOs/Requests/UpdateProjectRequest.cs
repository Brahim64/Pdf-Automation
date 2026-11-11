using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs.Requests
{
    /// <summary>Payload for updating a project.</summary>
    public sealed record UpdateProjectRequest
    {
        [Required]
        [MaxLength(255)]
        public required string Name { get; init; }

        [MaxLength(1000)]
        public string? Description { get; init; }
    }
}
