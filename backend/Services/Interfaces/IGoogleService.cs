using Google.Apis.Auth;
using backend.Models.DTOs.Requests;

namespace backend.Services.Interfaces
{
    public interface IGoogleService
    {
        Task<GoogleJsonWebSignature.Payload> validateGoogleIDToken(GoogleLoginRequest request);
        Task<GoogleJsonWebSignature.Payload> ValidateGoogleIDToken(GoogleLoginRequest request);
    }
}

