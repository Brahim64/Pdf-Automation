/**
 * Backend User Domain Model (matches backend.Models.Domain.User)
 */
export interface User {
  id: string; // Guid
  googleId: string;
  email: string;
  name: string;
  pictureUrl?: string | null;
  createdAt: string | Date;
  lastLoginAt?: string | Date | null;
  isActive: boolean;
}

/**
 * Backend User DTO (matches backend.Models.DTOs.Responses.UserDto)
 */
export interface UserDto {
  id: string; // Guid
  email: string;
  name: string;
  pictureUrl?: string | null;
  createdAt: string | Date;
  lastLoginAt?: string | Date | null;
}

/**
 * Backend Auth Response (matches backend.Models.DTOs.Responses.AuthResponse)
 */
export interface AuthResponse {
  token: string;
  user: UserDto;
  expiresAt: string | Date;
}

/**
 * Backend Google Login Request (matches backend.Models.DTOs.Requests.GoogleLoginRequest)
 */
export interface GoogleLoginRequest {
  idToken: string;
}
