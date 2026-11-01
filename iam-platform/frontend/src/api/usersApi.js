import { httpClient } from './httpClient';

/**
 * Strips any sensitive security fields like passwordHash from user records
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export const usersApi = {
  /**
   * Fetch all users
   * @returns {Promise<Array<{ id: number, name: string, email: string, enabled: boolean, locked: boolean, emailVerified: boolean, roles: Array<{ id: number, name: string }> }>>}
   */
  async getAllUsers() {
    const response = await httpClient.get('/api/users');
    const users = Array.isArray(response.data) ? response.data : [];
    return users.map(sanitizeUser);
  },

  /**
   * Fetch user by id
   * @param {number} id
   */
  async getUserById(id) {
    const response = await httpClient.get(`/api/users/${id}`);
    return sanitizeUser(response.data);
  },
};
