import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ActualizarKilometraje.css';

export default function ActualizarKilometraje({ onKilometrajeActualizado }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoId, setVehiculoId] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('access');

  useEffect(() => {
    obtenerVehiculos();
  }, []);

  const obtenerVehiculos = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/transportista/vehiculo`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const lista = Array.isArray(response.data) ? response.data : [response.data];
      setVehiculos(lista);

      if (lista.length > 0) {
        setVehiculoId(lista[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehiculoId) {
      alert('Por favor seleccione un vehículo.');
      return;
    }

    setLoading(true);
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/transportista/vehiculo/kilometraje`,
        {
          vehiculo_id: vehiculoId,
          kilometraje_actual: parseInt(kilometraje)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Kilometraje actualizado exitosamente.');
      setKilometraje('');
      obtenerVehiculos();
      if (onKilometrajeActualizado) onKilometrajeActualizado();
    } catch (error) {
      alert('Error al actualizar kilometraje.');
    }
    setLoading(false);
  };

  const vehiculoSeleccionado = vehiculos.find(v => v.id == vehiculoId);

  return (
    <div className="vlc-km-container">
      <div className="vlc-km-card">
        <div className="vlc-km-header">
          <h2>Actualizar Kilometraje</h2>
          <p>Registre el kilometraje actual de su unidad para el control de mantenimientos.</p>
        </div>

        <form className="vlc-km-form" onSubmit={handleSubmit}>

          <div className="vlc-km-field">
            <label>Seleccionar Unidad</label>
            <select
              value={vehiculoId}
              onChange={(e) => setVehiculoId(e.target.value)}
              className="vlc-km-select"
              disabled={vehiculos.length === 0}
            >
              {vehiculos.length === 0 ? (
                <option value="">No tiene unidades asociadas</option>
              ) : (
                vehiculos.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.placa} - {v.modelo}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="vlc-km-field">
            <label>Nuevo Kilometraje (km)</label>
            <input
              type="number"
              value={kilometraje}
              onChange={e => setKilometraje(e.target.value)}
              required
              placeholder="Ingrese el valor del tablero"
              min={vehiculoSeleccionado ? vehiculoSeleccionado.kilometraje_actual : 0}
            />
            {vehiculoSeleccionado && (
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                Actual registrado: <strong>{vehiculoSeleccionado.kilometraje_actual} km</strong>
              </div>
            )}
          </div>

          <button type="submit" className="vlc-km-submit" disabled={loading}>
            {loading ? 'Actualizando...' : 'Confirmar Actualización'}
          </button>
        </form>
      </div>
    </div>
  );
}