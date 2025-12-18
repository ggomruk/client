import axiosInstance from "../app/_api/axios";

interface GeneralResponse<T = any> {
  isOk: boolean;
  errorCode: number | null;
  message: string;
  payload: T | null;
}

interface LoginData {
  access_token: string;
  refresh_token?: string;
  user: {
    userId: string;
    username: string;
    email: string;
  };
}

interface VerifyData {
  valid: boolean;
  user: {
    userId: string;
    username: string;
    email: string;
  };
}

interface RefreshData {
  access_token: string;
}

class AuthService {
  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<GeneralResponse<LoginData>> {
    try {
      const response = await axiosInstance.post<GeneralResponse<LoginData>>(
        '/auth/login',
        { username, password }
      );
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      return {
        isOk: false,
        errorCode: error.response?.data?.errorCode || 9001,
        message: error.response?.data?.message || 'Login failed. Please try again.',
        payload: null,
      };
    }
  }

  /**
   * Signup new user
   */
  async signup(username: string, password: string, email: string): Promise<GeneralResponse<LoginData>> {
    try {
      const response = await axiosInstance.post<GeneralResponse<LoginData>>(
        '/auth/signup',
        { username, password, email }
      );
      return response.data;
    } catch (error: any) {
      console.error('Signup API error:', error);
      return {
        isOk: false,
        errorCode: error.response?.data?.errorCode || 9001,
        message: error.response?.data?.message || 'Signup failed. Please try again.',
        payload: null,
      };
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<GeneralResponse<null>> {
    try {
      const response = await axiosInstance.post<GeneralResponse<null>>(
        '/auth/signout',
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error('Logout API error:', error);
      return {
        isOk: false,
        errorCode: error.response?.data?.errorCode || 9001,
        message: error.response?.data?.message || 'Logout failed. Please try again.',
        payload: null,
      };
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const response = await axiosInstance.get<GeneralResponse<VerifyData>>(
        '/auth/verify'
      );
      
      if (response.data.isOk && response.data.payload?.valid && response.data.payload.user) {
        return response.data.payload.user;
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
      const response = await axiosInstance.get<GeneralResponse<any>>(
        '/auth/profile'
      );
      
      if (response.data.isOk && response.data.payload) {
        return response.data.payload;
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
  async refreshToken(refreshToken: string): Promise<GeneralResponse<RefreshData>> {
    try {
      const response = await axiosInstance.post<GeneralResponse<RefreshData>>(
        '/auth/refresh',
        { refresh_token: refreshToken }
      );
      return response.data;
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return {
        isOk: false,
        errorCode: error.response?.data?.errorCode || 9001,
        message: error.response?.data?.message || 'Token refresh failed. Please try again.',
        payload: null,
      };
    }
  }
}

const authService = new AuthService();
export default authService;
