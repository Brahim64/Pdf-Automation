using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;

namespace backend.Models.Domain
{
    [Table("DataFiles")]
    public class DataFile
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public Guid DataFileId
        {
            get => Id;
            set => Id = value;
        }

        [Required]
        [MaxLength(255)]
        public string DataFileName { get; set; } = string.Empty;

        [Required]
        public DataFileType DataFileType { get; set; }

        [Required]
        public Guid OwnerId { get; set; }

        [Required]
        public Guid ProjectId { get; set; }

        [MaxLength(1000)]
        public string? FilePath { get; set; }

        [MaxLength(50)]
        public string? FileExtension { get; set; }

        public long FileSize { get; set; }

        public int? RowCount { get; set; }

        /// <summary>
        /// JSON string storing detected column/header names to assist with template variable mapping.
        /// </summary>
        public string? HeadersJson { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey(nameof(OwnerId))]
        public virtual User? Owner { get; set; }

        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }

        public virtual ICollection<PdfResult> PdfResults { get; set; } = new List<PdfResult>();
    }
}

