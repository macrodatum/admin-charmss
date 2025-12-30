import ApiClient from './api/axios/apiClient';
import { PerformerProfile } from '../types/performers.types';

const BASE = '/api/performers';

class PerformerProfileService {
  /**
   * Obtiene el perfil completo de un performer por su ID
   * @param performerId - ID del performer
   * @returns Promise con los datos del perfil
   */
  async getPerformerProfile(performerId: string | number): Promise<PerformerProfile> {
    try {
      const response = await ApiClient.get<PerformerProfile>(`${BASE}/${performerId}/profile`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching profile for performer ${performerId}:`, error);
      throw error;
    }
  }

  /**
   * Update performer profile partial fields (e.g., videoAssetId, profileAssetId)
   */
  async updatePerformerProfile(
    performerId: string | number,
    data: Partial<PerformerProfile>
  ): Promise<PerformerProfile> {
    try {
      const response = await ApiClient.patch<PerformerProfile>(`${BASE}/${performerId}/profile`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating profile for performer ${performerId}:`, error);
      throw error;
    }
  }
}

export default new PerformerProfileService();
