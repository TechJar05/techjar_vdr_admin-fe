import axios from './axios';
import type { LoginCredentials, AuthResponse, Admin } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/superadmin/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // No backend logout endpoint needed - just clear local storage
    return Promise.resolve();
  },

  getProfile: async (): Promise<Admin> => {
    // For superadmin, profile is stored locally after login
    const storedAdmin = localStorage.getItem('vdr_admin_user');
    if (storedAdmin) {
      return JSON.parse(storedAdmin);
    }
    throw new Error('Not authenticated');
  },
};
