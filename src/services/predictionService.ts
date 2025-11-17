import api from './api';

export interface Prediction {
  _id: string;
  userId: string;
  result: {
    predicted_label: string;
    confidence_score: number;
  };
  imageUrl: string;
  createdAt: string;
}

export interface PredictionResult {
  predicted_label: string;
  confidence_score: number;
  image_url: string;
}

export const predictionService = {
  // Get all predictions for current user
  getPredictions: async () => {
    try {
      const response = await api.get('/api/predictions');
      return { success: true, data: response.data as Prediction[] };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch predictions',
      };
    }
  },

  // Upload image for prediction
  uploadImage: async (imageUri: string) => {
    try {
      const formData = new FormData();
      
      // Extract filename from URI
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      const response = await api.post('/api/predictions/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data as PredictionResult };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Prediction failed',
      };
    }
  },
};
