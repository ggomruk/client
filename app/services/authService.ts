import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface LoginResponse {
  ok: number;
  data?: {
    access_token: string;
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

class AuthService {
  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/api/auth/login`,
        { username, password },
        {
          headers: { 'Content-Type': 'application/json' },
        }
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
      const response = await axios.post<SignupResponse>(
        `${API_URL}/api/auth/signup`,
        { username, password, email },
        {
          headers: { 'Content-Type': 'application/json' },
        }
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
      const response = await axios.post<LogoutResponse>(
        `${API_URL}/api/auth/signout`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
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
      const response = await axios.get<VerifyResponse>(
        `${API_URL}/api/auth/verify`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
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
      const response = await axios.get(
        `${API_URL}/api/auth/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
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
}

const authService = new AuthService();
export default authService;
