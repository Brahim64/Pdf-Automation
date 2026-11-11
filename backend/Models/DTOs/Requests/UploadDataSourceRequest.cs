using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace backend.Models.DTOs.Requests
{
    /// <summary>Uploads a CSV or Excel data source to a project.</summary>
    public sealed record UploadDataSourceRequest
    {
        /// <summary>The project that owns the uploaded data source.</summary>
        [Required]
        public Guid ProjectId { get; init; }

        /// <summary>The CSV, XLS, or XLSX file to upload.</summary>
        [Required]
        public IFormFile File { get; init; } = null!;
    }
}
