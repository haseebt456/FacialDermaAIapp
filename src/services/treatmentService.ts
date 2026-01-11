import api from './api';

export interface TreatmentSuggestion {
  _id?: string;
  name: string;
  treatments: string[];
  prevention: string[];
  resources?: string[];
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const treatmentService = {
  // Get all treatment suggestions
  async getAllTreatments(): Promise<ApiResponse<TreatmentSuggestion[]>> {
    try {
      const response = await api.get('/api/treatment/suggestions');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.log('Error fetching all treatments:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch treatments',
      };
    }
  },

  // Get treatment suggestion by condition name
  async getTreatmentByName(name: string): Promise<ApiResponse<TreatmentSuggestion>> {
    try {
      // The backend expects the name in a specific format
      // Try multiple variations to find the treatment
      console.log('Original condition name:', name);
      
      // List of variations to try
      const variations = [
        name, // Original (e.g., "Acne", "Eczema")
        name.toLowerCase(), // lowercase (e.g., "acne", "eczema")
        name.toLowerCase().replace(/\s+/g, '_'), // lowercase with underscores
        name.replace(/\s+/g, '_'), // original case with underscores
      ];
      
      // Remove duplicates
      const uniqueVariations = [...new Set(variations)];
      
      for (const variation of uniqueVariations) {
        try {
          console.log('Trying treatment name:', variation);
          const response = await api.get(`/api/treatment/suggestions/${encodeURIComponent(variation)}`);
          console.log('Treatment found:', response.data);
          return { success: true, data: response.data };
        } catch (err: any) {
          // Continue to next variation if not found (404)
          if (err.response?.status === 404) {
            console.log('Not found with name:', variation);
            continue;
          }
          // If it's a different error, throw it
          throw err;
        }
      }
      
      // If we get here, none of the variations worked
      console.log('Treatment not found for any variation of:', name);
      return {
        success: false,
        error: 'Treatment not found for this condition',
      };
    } catch (error: any) {
      console.log('Error fetching treatment:', error?.response?.status, error?.response?.data);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch treatment',
      };
    }
  },
};
