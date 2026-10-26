using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Domain
{
    [Table("Projects")]
    public class Project
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public Guid ProjectId
        {
            get => Id;
            set => Id = value;
        }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public Guid OwnerId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey(nameof(OwnerId))]
        public virtual User? Owner { get; set; }

        public virtual ICollection<Template> Templates { get; set; } = new List<Template>();
        public virtual ICollection<DataFile> DataFiles { get; set; } = new List<DataFile>();
        public virtual ICollection<PdfResult> PdfResults { get; set; } = new List<PdfResult>();
    }
}

