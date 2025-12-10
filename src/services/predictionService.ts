import api from './api';

export interface Prediction {
  id: string;
  userId: string;
  result: {
    predicted_label: string;
    confidence_score: number;
    all_probabilities?: {
      Eczema: number;
      Acne: number;
      melasma: number;
      Rosacea: number;
      'Seborrheic Dermatitis': number;
    };
  };
  imageUrl: string;
  reportId?: string;
  createdAt: string;
}

export interface PredictionResult {
  predicted_label: string;
  confidence_score: number;
  image_url: string;
  report_id: string;
  all_probabilities: {
    Eczema: number;
    Acne: number;
    melasma: number;
    Rosacea: number;
    'Seborrheic Dermatitis': number;
  };
}

export const predictionService = {
  // Get all predictions for current user
  getPredictions: async () => {
    try {
      const response = await api.get('/api/predictions');
      return { success: true, data: response.data as Prediction[] };
    } catch (error: any) {
      let message = 'Unable to load your predictions. Please try again.';
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  },

  // Delete a prediction by id
  deletePrediction: async (id: string) => {
    try {
      await api.delete(`/api/predictions/${id}`);
      return { success: true };
    } catch (error: any) {
      let message = 'Failed to delete prediction.';
      if (error.response?.data?.error) {
        const err = error.response.data.error.toLowerCase();
        if (err.includes('invalid')) {
          message = 'Invalid prediction ID.';
        } else if (err.includes('not found') || err.includes('permission')) {
          message = 'Prediction not found or you do not have permission to delete it.';
        } else {
          message = error.response.data.error;
        }
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection.';
      }
      return { success: false, error: message };
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
          // Let Axios set the correct multipart boundary
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: [(data) => data],
        timeout: 60000,
      });

      return { success: true, data: response.data as PredictionResult };
    } catch (error: any) {
      let message = 'Unable to analyze image. Please try again.';
      
      // Check for detailed error from API
      if (error.response?.data?.error) {
        const err = error.response.data.error.toLowerCase();
        if (err.includes('no face detected')) {
          message = 'No face detected in the image. Please upload a clear photo showing your face.';
        } else if (err.includes('face is too small')) {
          message = 'Your face is too small in the image. Please move closer or upload a clearer photo.';
        } else if (err.includes('upload') && err.includes('failed')) {
          message = 'Failed to upload image. Please try again.';
        } else {
          message = error.response.data.error;
        }
      } else if (error.response?.data?.detail?.error) {
        // Some APIs wrap errors in detail object
        message = error.response.data.detail.error;
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (error.code === 'ECONNABORTED') {
        message = 'Analysis is taking too long. Please try with a smaller or clearer image.';
      }
      
      // Include validation details if available
      const validationDetails = error.response?.data?.validation_details;
      
      return { 
        success: false, 
        error: message,
        validationDetails,
      };
    }
  },
};
