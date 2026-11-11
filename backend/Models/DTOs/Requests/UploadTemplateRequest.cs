using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace backend.Models.DTOs.Requests
{
    /// <summary>Uploads a PDF or DOCX template to a project.</summary>
    public sealed record UploadTemplateRequest
    {
        /// <summary>The project that owns the uploaded template.</summary>
        [Required]
        public Guid ProjectId { get; init; }

        /// <summary>The PDF or DOCX template file to upload.</summary>
        [Required]
        public IFormFile File { get; init; } = null!;
    }
}
