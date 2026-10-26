using backend.Models.Domain;

namespace backend.Data.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByGoogleIdAsync(string googleId);
        Task<User?> GetByEmailAsync(string email);
        Task<User> AddAsync(User user);
        Task UpdateAsync(User user);
        Task<bool> SaveChangesAsync();
    }
}

