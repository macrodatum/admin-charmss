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
   * Actualiza únicamente el nickname del perfil del performer.
   * PATCH /api/performers/{id}/profile/nickname
   */
  async updateNickname(
    performerId: string | number,
    nickName: string
  ): Promise<{ nickName: string }> {
    const response = await ApiClient.patch<{ nickName: string }>(
      `${BASE}/${performerId}/profile/nickname`,
      { nickName }
    );
    return response.data;
  }

  /**
   * Update performer profile partial fields (e.g., videoAssetId, profileAssetId)
   */
  async updatePerformerProfile(
    performerId: string | number,
    data: Partial<PerformerProfile>
  ): Promise<PerformerProfile> {
    try {
      const response = await ApiClient.patch<PerformerProfile>(
        `${BASE}/${performerId}/profile`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating profile for performer ${performerId}:`, error);
      throw error;
    }
  }
}

export default new PerformerProfileService();
