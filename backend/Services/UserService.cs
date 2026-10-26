using backend.Common.Helpers;
using backend.Data.Repositories;
using backend.Models.Domain;
using backend.Models.DTOs.Requests;
using backend.Models.DTOs.Responses;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IGoogleService _googleService;
        private readonly JwtHelpers _jwtHelpers;
        private readonly IConfiguration _config;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IUserRepository userRepository,
            IGoogleService googleService,
            JwtHelpers jwtHelpers,
            IConfiguration config,
            ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _googleService = googleService;
            _jwtHelpers = jwtHelpers;
            _config = config;
            _logger = logger;
        }

        public async Task<AuthResponse> AuthenticateGoogleUserAsync(GoogleLoginRequest request)
        {
            _logger.LogInformation("Validating Google ID token...");
            var payload = await _googleService.validateGoogleIDToken(request);

            if (payload == null)
            {
                _logger.LogWarning("Google token validation failed or returned null payload.");
                throw new UnauthorizedAccessException("Invalid Google authentication token.");
            }

            var googleId = payload.Subject;
            var email = payload.Email;
            var name = payload.Name ?? payload.Email;
            var pictureUrl = payload.Picture;

            // Find existing user by GoogleId or Email
            var user = await _userRepository.GetByGoogleIdAsync(googleId)
                       ?? await _userRepository.GetByEmailAsync(email);

            if (user == null)
            {
                _logger.LogInformation("User with email {Email} not found. Creating new user record...", email);
                user = new User
                {
                    Id = Guid.NewGuid(),
                    GoogleId = googleId,
                    Email = email,
                    Name = name,
                    PictureUrl = pictureUrl,
                    CreatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow,
                    IsActive = true
                };

                await _userRepository.AddAsync(user);
            }
            else
            {
                _logger.LogInformation("User found ({UserId}). Updating profile & last login time...", user.Id);
                user.GoogleId = googleId;
                user.LastLoginAt = DateTime.UtcNow;

                if (!string.IsNullOrWhiteSpace(name))
                {
                    user.Name = name;
                }

                if (!string.IsNullOrWhiteSpace(pictureUrl))
                {
                    user.PictureUrl = pictureUrl;
                }

                await _userRepository.UpdateAsync(user);
            }

            await _userRepository.SaveChangesAsync();

            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
            var issuer = _config["Jwt:Issuer"] ?? "PdfAutomation";
            var audience = _config["Jwt:Audience"] ?? "PdfAutomation";
            var expireMinutes = int.TryParse(_config["Jwt:ExpireMinutes"], out var minutes) ? minutes : 60;

            var token = _jwtHelpers.GenerateUserJwtToken(user, jwtKey, issuer, audience, expireMinutes);
            var expiresAt = DateTime.UtcNow.AddMinutes(expireMinutes);

            return new AuthResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    PictureUrl = user.PictureUrl,
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt
                }
            };
        }

        public async Task<UserDto?> GetUserByIdAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                PictureUrl = user.PictureUrl,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                PictureUrl = user.PictureUrl,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };
        }
    }
}

