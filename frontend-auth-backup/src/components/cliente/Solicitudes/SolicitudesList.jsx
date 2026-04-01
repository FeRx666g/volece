import React, { useState, useEffect } from 'react';
import { obtenerSolicitudesCliente } from '../../../Servicios/SolicitudServicio';

const SolicitudesList = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                const data = await obtenerSolicitudesCliente(localStorage.getItem('authToken'));
                setSolicitudes(data);
            } catch (err) {
                setError("Error al cargar solicitudes");
            }
        };

        fetchSolicitudes();
    }, []);

    return (
        <div>
            <h2>Mis Solicitudes</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {solicitudes.length > 0 ? (
                    solicitudes.map((solicitud) => (
                        <li key={solicitud.id}>
                            {solicitud.origen} → {solicitud.destino} - Estado: {solicitud.estado_nombre || solicitud.estado}
                        </li>
                    ))
                ) : (
                    <p>No tienes solicitudes registradas.</p>
                )}
            </ul>
        </div>
    );
};

export default SolicitudesList;
