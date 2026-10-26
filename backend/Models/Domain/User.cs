using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Domain
{
    [Table("Users")]
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(255)]
        public string GoogleId { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? PictureUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginAt { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation collections
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        public virtual ICollection<Template> Templates { get; set; } = new List<Template>();
        public virtual ICollection<DataFile> DataFiles { get; set; } = new List<DataFile>();
        public virtual ICollection<PdfResult> PdfResults { get; set; } = new List<PdfResult>();
    }
}

