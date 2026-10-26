using Google.Apis.Auth;
using backend.Models.DTOs.Requests;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class GoogleService : IGoogleService
    {
        private readonly IConfiguration _config;

        public GoogleService(IConfiguration config)
        {
            _config = config;
        }

        public async Task<GoogleJsonWebSignature.Payload> ValidateGoogleIDToken(GoogleLoginRequest request)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [_config["Authentication:Google:ClientId"]]
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
            return payload;
        }

        public Task<GoogleJsonWebSignature.Payload> validateGoogleIDToken(GoogleLoginRequest request)
            => ValidateGoogleIDToken(request);
    }
}
