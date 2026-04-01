import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/transporte/asignar-turno/`;

export const predecirTurnoIA = async (datos, access) => {
  try {
    const response = await axios.post(API_URL, datos, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access}` 
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al predecir con IA:', error.response?.data || error.message);
    throw error;
  }
};
