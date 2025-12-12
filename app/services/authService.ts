import axiosInstance from '../app/_api/axios';

interface LoginResponse {
  ok: number;
  data?: {
    access_token: string;
    refresh_token?: string;
    user: {
      userId: string;
      username: string;
      email: string;
    };
  };
  error?: string;
}

interface SignupResponse {
  ok: number;
  data?: {
    access_token: string;
    refresh_token?: string;
    user: {
      userId: string;
      username: string;
      email: string;
    };
  };
  error?: string;
}

interface LogoutResponse {
  ok: number;
  message?: string;
  error?: string;
}

interface VerifyResponse {
  ok: number;
  valid?: boolean;
  user?: {
    userId: string;
    username: string;
    email: string;
  };
  error?: string;
}

interface RefreshResponse {
  ok: number;
  data?: {
    access_token: string;
  };
  error?: string;
}

class AuthService {
  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<LoginResponse>(
        '/auth/login',
        { username, password }
      );
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      return {
        ok: 0,
        error: error.response?.data?.error || error.message || 'Login failed',
      };
    }
  }

  /**
   * Signup new user
   */
  async signup(username: string, password: string, email: string): Promise<SignupResponse> {
    try {
      const response = await axiosInstance.post<SignupResponse>(
        '/auth/signup',
        { username, password, email }
      );
      return response.data;
    } catch (error: any) {
      console.error('Signup API error:', error);
      return {
        ok: 0,
        error: error.response?.data?.error || error.message || 'Signup failed',
      };
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<LogoutResponse> {
    try {
      const response = await axiosInstance.post<LogoutResponse>(
        '/auth/signout',
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error('Logout API error:', error);
      return {
        ok: 0,
        error: error.response?.data?.error || error.message || 'Logout failed',
      };
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const response = await axiosInstance.get<VerifyResponse>(
        '/auth/verify'
      );
      
      if (response.data.ok && response.data.valid && response.data.user) {
        return response.data.user;
      } else {
        throw new Error('Invalid token');
      }
    } catch (error: any) {
      console.error('Token verification error:', error);
      throw new Error('Token verification failed');
    }
  }

  /**
   * Get user profile
   */
  async getProfile(token: string): Promise<any> {
    try {
      const response = await axiosInstance.get(
        '/auth/profile'
      );
      
      if (response.data.ok && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Failed to get profile');
      }
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw new Error('Failed to get profile');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    try {
      const response = await axiosInstance.post<RefreshResponse>(
        '/auth/refresh',
        { refresh_token: refreshToken }
      );
      return response.data;
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return {
        ok: 0,
        error: error.response?.data?.error || error.message || 'Token refresh failed',
      };
    }
  }
}

const authService = new AuthService();
export default authService;
