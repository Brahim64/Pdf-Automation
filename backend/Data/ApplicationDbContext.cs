using Microsoft.EntityFrameworkCore;
using backend.Models.Domain;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<Template> Templates => Set<Template>();
        public DbSet<DataFile> DataFiles => Set<DataFile>();
        public DbSet<PdfResult> PdfResults => Set<PdfResult>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.HasIndex(u => u.GoogleId).IsUnique();
            });

            // Project configuration
            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasOne(p => p.Owner)
                      .WithMany(u => u.Projects)
                      .HasForeignKey(p => p.OwnerId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Template configuration
            modelBuilder.Entity<Template>(entity =>
            {
                entity.HasOne(t => t.Project)
                      .WithMany(p => p.Templates)
                      .HasForeignKey(t => t.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(t => t.Owner)
                      .WithMany(u => u.Templates)
                      .HasForeignKey(t => t.OwnerId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // DataFile configuration
            modelBuilder.Entity<DataFile>(entity =>
            {
                entity.HasOne(d => d.Project)
                      .WithMany(p => p.DataFiles)
                      .HasForeignKey(d => d.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Owner)
                      .WithMany(u => u.DataFiles)
                      .HasForeignKey(d => d.OwnerId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // PdfResult configuration
            modelBuilder.Entity<PdfResult>(entity =>
            {
                entity.HasOne(r => r.Project)
                      .WithMany(p => p.PdfResults)
                      .HasForeignKey(r => r.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Owner)
                      .WithMany(u => u.PdfResults)
                      .HasForeignKey(r => r.OwnerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Template)
                      .WithMany(t => t.PdfResults)
                      .HasForeignKey(r => r.TemplateId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(r => r.DataFile)
                      .WithMany(d => d.PdfResults)
                      .HasForeignKey(r => r.DataFileId)
                      .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
