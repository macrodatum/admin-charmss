/**
 * Like Preferences Service
 * Mock service - Backend endpoint pendiente de implementación
 */

// Estructura de datos para preferencias "I Like"
export interface LikePreference {
  id: number;
  category: string; // 'activities', 'interests', 'music', 'movies', etc.
  value: string;
  selected: boolean;
}

export interface PerformerLikePreferences {
  performerId: string;
  preferences: LikePreference[];
  customPreferences: string[]; // Preferencias personalizadas
  updatedAt?: string;
}

class LikeService {
  /**
   * Obtener preferencias del performer
   * @param performerId ID del performer
   * @returns Preferencias del performer
   */
  async getPerformerLikes(performerId: string): Promise<PerformerLikePreferences> {
    // Simulación de delay de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data
    return {
      performerId,
      preferences: [
        { id: 1, category: 'activities', value: 'Dancing', selected: true },
        { id: 2, category: 'activities', value: 'Travel', selected: true },
        { id: 3, category: 'interests', value: 'Music', selected: true },
        { id: 4, category: 'music', value: 'Pop', selected: true },
      ],
      customPreferences: ['Sunset watching', 'Beach walks'],
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Actualizar preferencias del performer
   * @param performerId ID del performer
   * @param preferences Preferencias a actualizar
   * @returns Preferencias actualizadas
   */
  async updatePerformerLikes(
    performerId: string,
    preferences: Partial<PerformerLikePreferences>
  ): Promise<PerformerLikePreferences> {
    // TODO: Implementar llamada a backend cuando esté disponible
    console.log('Mock: Updating likes for performer', performerId, preferences);

    // Simulación de delay de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      performerId,
      preferences: preferences.preferences || [],
      customPreferences: preferences.customPreferences || [],
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Opciones para favoritos (para usar en UI de selección tipo tags)
   */
  getFavoriteOptions() {
    return {
      favoriteColor: ['Red', 'Blue', 'Green', 'Black', 'White', 'Purple'],
      favoriteCandies: ['Chocolate', 'Gummies', 'Lollipops', 'Hard candies'],
      favoriteBeverages: ['Coffee', 'Tea', 'Soda', 'Juice', 'Water', 'Wine'],
      favoriteFood: ['Pizza', 'Sushi', 'Pasta', 'Burgers', 'Salads'],
      favoriteMusic: ['Pop', 'Rock', 'Electronic', 'Jazz', 'Hip Hop', 'Classical'],
      languages: ['English', 'Spanish', 'French', 'Portuguese', 'German', 'Italian'],
    };
  }
}

export default new LikeService();
