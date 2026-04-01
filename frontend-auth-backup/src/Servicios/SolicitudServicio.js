import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/servicios/`;

export const crearSolicitud = async (data) => {
    const token = localStorage.getItem('access');

    if (!token) {
        console.error('No token found');
        return;
    }

    try {
        const response = await axios.post(`${API_URL}solicitudes/crear/`, data, {
            headers: {
                'Authorization': `Bearer ${token}`,  
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear solicitud', error);
        throw error;
    }
};


export const obtenerSolicitudesCliente = async () => {
  const token = localStorage.getItem('access') || localStorage.getItem('authToken');

  if (!token) {
    throw new Error("Token no encontrado. El usuario debe estar autenticado.");
  }

  try {
    const response = await axios.get(`${API_URL}solicitudes/mis-solicitudes/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener las solicitudes", error);
    throw error;
  }
};
