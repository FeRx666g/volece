import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MantenimientoForm.css';

export default function MantenimientoForm({ onMantenimientoRegistrado }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [tiposMantenimiento, setTiposMantenimiento] = useState([]);

  const [tipo, setTipo] = useState('');
  const [kilometrajeActual, setKilometrajeActual] = useState('');
  const [kilometrajeProximo, setKilometrajeProximo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [kmBase, setKmBase] = useState(0);
  const [vehiculoId, setVehiculoId] = useState('');

  const token = localStorage.getItem('access');

  useEffect(() => {
    obtenerVehiculos();
    obtenerTiposMantenimiento();
  }, []);

  const obtenerTiposMantenimiento = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/tipos-mantenimiento/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const lista = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setTiposMantenimiento(lista);

      if (lista.length > 0) {
        setTipo(lista[0].id);
      }
    } catch (err) {
      console.error("Error cargando tipos de mantenimiento", err);
      setTiposMantenimiento([]);
    }
  };

  useEffect(() => {
    if (vehiculoId && vehiculos.length > 0) {
      const vehiculo = vehiculos.find(v => v.id == vehiculoId);
      if (vehiculo) {
        setKmBase(vehiculo.kilometraje_actual);
        setKilometrajeActual(vehiculo.kilometraje_actual);
      }
    }
  }, [vehiculoId, vehiculos]);

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
    const kmActual = parseInt(kilometrajeActual);
    const kmProximo = parseInt(kilometrajeProximo);

    if (!vehiculoId) {
      alert('Por favor seleccione un vehículo.');
      return;
    }

    if (kmActual < kmBase) {
      const confirmar = window.confirm(`El kilometraje ingresado (${kmActual}) es menor al actual del sistema (${kmBase}). ¿Es una corrección?`);
      if (!confirmar) return;
    }

    if (kmProximo <= kmActual) {
      alert('El Kilometraje Próximo debe ser mayor al actual.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/transportista/mantenimientos`,
        {
          tipo, // This is now the ID
          kilometraje_actual: kmActual,
          kilometraje_proximo: kmProximo,
          fecha_mantenimiento: fecha,
          observaciones,
          vehiculo: vehiculoId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Mantenimiento registrado exitosamente.');

      // setTipo('CAMBIO_ACEITE'); // No longer valid default
      if (tiposMantenimiento.length > 0) setTipo(tiposMantenimiento[0].id);

      setKilometrajeActual('');
      setKilometrajeProximo('');
      setObservaciones('');
      setFecha(new Date().toISOString().split('T')[0]);

      obtenerVehiculos();

      if (onMantenimientoRegistrado) onMantenimientoRegistrado();
    } catch (error) {
      console.error(error);
      alert('Error al registrar mantenimiento.');
    }
    setLoading(false);
  };

  return (
    <div className="vlc-mnt-container">
      <form className="vlc-mnt-form" onSubmit={handleSubmit}>
        <div className="vlc-mnt-header">
          <h2>Registrar Mantenimiento</h2>
          <p>Ingrese los datos técnicos del servicio.</p>
        </div>

        <div className="vlc-mnt-body">

          <div className="vlc-mnt-field">
            <label>Seleccionar Unidad</label>
            <select
              value={vehiculoId}
              onChange={(e) => setVehiculoId(e.target.value)}
              required
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

          <div className="vlc-mnt-grid">
            <div className="vlc-mnt-field">
              <label>Tipo de Servicio</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)}>
                {tiposMantenimiento.map(op => (
                  <option key={op.id} value={op.id}>{op.nombre}</option>
                ))}
              </select>
            </div>

            <div className="vlc-mnt-field">
              <label>Fecha del Servicio</label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="vlc-mnt-grid">
            <div className="vlc-mnt-field">
              <label>Kilometraje Actual</label>
              <input
                type="number"
                value={kilometrajeActual}
                onChange={e => setKilometrajeActual(e.target.value)}
                required
                placeholder="Ingrese nuevo KM"
              />
              <small style={{ color: '#64748b', marginTop: '4px', display: 'block', fontSize: '0.8rem' }}>
                Último registrado: <strong>{kmBase.toLocaleString()} km</strong>
              </small>
            </div>

            <div className="vlc-mnt-field">
              <label>Próximo Mantenimiento (km)</label>
              <input
                type="number"
                value={kilometrajeProximo}
                onChange={e => setKilometrajeProximo(e.target.value)}
                required
                placeholder="Ej: 55000"
              />
            </div>
          </div>

          <div className="vlc-mnt-field">
            <label>Observaciones</label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Detalles del servicio..."
              rows="2"
            />
          </div>

          <button type="submit" className="vlc-mnt-submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
}