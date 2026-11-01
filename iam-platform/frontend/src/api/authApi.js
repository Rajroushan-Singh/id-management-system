import { httpClient } from './httpClient';

export const authApi = {
  /**
   * Register a new user
   * @param {{ name: string, email: string, password: string }} data
   * @returns {Promise<{ userId: number, name: string, email: string, message: string }>}
   */
  async register(data) {
    const response = await httpClient.post('/api/auth/register', data);
    return response.data;
  },

  /**
   * Log in with email and password
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ userId: number, name: string, email: string, tokenType: string, accessToken: string, refreshToken: string, expiresIn: number, message: string }>}
   */
  async login(credentials) {
    const response = await httpClient.post('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Consume email verification token
   * @param {string} token
   * @returns {Promise<{ message: string }>}
   */
  async verifyEmail(token) {
    const response = await httpClient.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
    return response.data;
  },

  /**
   * Request password reset instructions
   * @param {{ email: string }} data
   * @returns {Promise<{ message: string }>}
   */
  async forgotPassword(data) {
    const response = await httpClient.post('/api/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password with token and new password
   * @param {{ token: string, newPassword: string }} data
   * @returns {Promise<{ message: string }>}
   */
  async resetPassword(data) {
    const response = await httpClient.post('/api/auth/reset-password', data);
    return response.data;
  },

  /**
   * Refresh access token
   * @param {string} refreshToken
   */
  async refresh(refreshToken) {
    const response = await httpClient.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Revoke refresh token and logout on backend
   * @param {string} refreshToken
   */
  async logout(refreshToken) {
    if (!refreshToken) return;
    try {
      await httpClient.post('/api/auth/logout', { refreshToken });
    } catch (err) {
      // Backend logout attempt completed or failed, client auth will still be cleared
      console.warn('Backend logout failed or token already invalid:', err.message);
    }
  },
};
