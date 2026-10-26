using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;

namespace backend.Models.Domain
{
    [Table("PdfResults")]
    public class PdfResult
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public Guid PdfResultId
        {
            get => Id;
            set => Id = value;
        }

        [Required]
        [MaxLength(255)]
        public string PdfFileName { get; set; } = string.Empty;

        [Required]
        public Guid OwnerId { get; set; }

        [Required]
        public Guid ProjectId { get; set; }

        public Guid? TemplateId { get; set; }

        public Guid? DataFileId { get; set; }

        public PdfResultStatus Status { get; set; } = PdfResultStatus.Pending;

        [MaxLength(1000)]
        public string? FilePath { get; set; }

        public long FileSize { get; set; }

        public int? GeneratedPageCount { get; set; }

        public string? ErrorMessage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedAt { get; set; }

        // Navigation properties
        [ForeignKey(nameof(OwnerId))]
        public virtual User? Owner { get; set; }

        [ForeignKey(nameof(ProjectId))]
        public virtual Project? Project { get; set; }

        [ForeignKey(nameof(TemplateId))]
        public virtual Template? Template { get; set; }

        [ForeignKey(nameof(DataFileId))]
        public virtual DataFile? DataFile { get; set; }
    }
}

