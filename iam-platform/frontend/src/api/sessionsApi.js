import { httpClient } from './httpClient';

export const sessionsApi = {
  async checkCurrentSession() {
    await httpClient.get('/api/sessions/current');
  },

  /**
   * Fetch active sessions for currently authenticated user
   * @returns {Promise<Array<{ sessionId: string, expiresAt: string }>>}
   */
  async getActiveSessions() {
    const response = await httpClient.get('/api/sessions');
    return response.data;
  },

  /**
   * Revoke a specific session
   * @param {string} sessionId
   */
  async revokeSession(sessionId) {
    const response = await httpClient.delete(`/api/sessions/${sessionId}`);
    return response.data;
  },
};
