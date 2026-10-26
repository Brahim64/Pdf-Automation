using backend.Models.DTOs.Requests;
using backend.Models.DTOs.Responses;

namespace backend.Services.Interfaces
{
    public interface IUserService
    {
        Task<AuthResponse> AuthenticateGoogleUserAsync(GoogleLoginRequest request);
        Task<UserDto?> GetUserByIdAsync(Guid id);
        Task<UserDto?> GetUserByEmailAsync(string email);
    }
}

