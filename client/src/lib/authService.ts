import { apiRequest } from './queryClient';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  address?: string;
  provider?: string;
  isVerified?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  redirectTo?: string;
}

export interface RegistrationData {
  fullName: string;
  dateOfBirth: string;
  mobileNumber: string;
  countryCode: string;
  address: string;
  email: string;
  password: string;
}

class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  private constructor() {
    this.loadTokensFromStorage();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Load tokens from localStorage
  private loadTokensFromStorage() {
    try {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      const expiry = localStorage.getItem('tokenExpiry');
      this.tokenExpiry = expiry ? parseInt(expiry) : null;
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
    }
  }

  // Save tokens to localStorage
  private saveTokensToStorage(tokens: AuthTokens) {
    try {
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      this.tokenExpiry = Date.now() + (tokens.expiresIn * 1000);

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('tokenExpiry', this.tokenExpiry.toString());
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  // Clear tokens from storage
  private clearTokensFromStorage() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;

    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    } catch (error) {
      console.error('Failed to clear tokens from storage:', error);
    }
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Check if token is expired
  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    return Date.now() >= this.tokenExpiry;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // Ensure tokens are loaded from storage
    if (!this.accessToken) {
      this.loadTokensFromStorage();
    }
    
    const hasToken = !!this.accessToken;
    const notExpired = !this.isTokenExpired();
    const result = hasToken && notExpired;
    
    console.log('authService.isAuthenticated():', { hasToken, notExpired, result, tokenExpiry: this.tokenExpiry, now: Date.now() });
    
    return result;
  }

  // Get authorization header
  getAuthHeader(): Record<string, string> {
    if (this.accessToken) {
      return { Authorization: `Bearer ${this.accessToken}` };
    }
    return {};
  }

  // Login with email/mobile and password
  async login(identifier: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });

      if (response.success) {
        this.saveTokensToStorage({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn
        });
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Login with OTP
  async loginWithOTP(identifier: string, otp: string): Promise<LoginResponse> {
    try {
      const response = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, otp }),
      });

      if (response.success) {
        this.saveTokensToStorage({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn
        });
      }

      return response;
    } catch (error) {
      console.error('OTP login error:', error);
      throw error;
    }
  }

  // Google OAuth login
  async loginWithGoogle(userData: { email: string; name: string; providerId?: string }): Promise<LoginResponse> {
    try {
      const response = await apiRequest('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ 
          provider: 'google',
          ...userData
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.success) {
        this.saveTokensToStorage({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn
        });
      }

      return response;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Apple ID login
  async loginWithApple(userData: { email: string; name: string; providerId?: string }): Promise<LoginResponse> {
    try {
      const response = await apiRequest('/api/auth/apple', {
        method: 'POST',
        body: JSON.stringify({ 
          provider: 'apple',
          ...userData
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.success) {
        this.saveTokensToStorage({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn
        });
      }

      return response;
    } catch (error) {
      console.error('Apple login error:', error);
      throw error;
    }
  }

  // Register user
  async register(step1Data: any, step2Data: { email: string; password: string }): Promise<LoginResponse> {
    try {
      // Step 1: Basic info
      const step1Response = await apiRequest('/api/register/step1', {
        method: 'POST',
        body: JSON.stringify(step1Data),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!step1Response.success) {
        throw new Error(step1Response.message);
      }

      // Step 2: Email and password with tempId
      const step2Response = await apiRequest('/api/register/step2', {
        method: 'POST',
        body: JSON.stringify({
          ...step2Data,
          tempId: step1Response.tempId
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (step2Response.success) {
        this.saveTokensToStorage({
          accessToken: step2Response.accessToken,
          refreshToken: step2Response.refreshToken,
          expiresIn: step2Response.expiresIn
        });
      }

      return step2Response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      this.logout();
      return false;
    }

    try {
      const response = await apiRequest('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.success) {
        this.saveTokensToStorage({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn
        });
        return true;
      } else {
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const response = await apiRequest('/api/auth/user', {
        method: 'GET',
        headers: this.getAuthHeader()
      });

      if (response.success) {
        return response.user;
      }
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Logout
  async logout() {
    try {
      // Call logout endpoint to invalidate server-side tokens
      await fetch('/api/logout', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearTokensFromStorage();
    }
  }

  // Send OTP
  async sendOTP(identifier: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest('/api/send-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;