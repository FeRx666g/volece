import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { crearSolicitud } from '../../../Servicios/SolicitudServicio';
import './estilosSolicitudes.css';

const SolicitarServicio = ({ onClose }) => {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState('');
  const [tiposVehiculos, setTiposVehiculos] = useState([]);
  const [tipoCarga, setTipoCarga] = useState('');
  const [tonelaje, setTonelaje] = useState('');
  const [fechaSolicitud, setFechaSolicitud] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/tipos/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
      .then(res => {
        if (Array.isArray(res.data)) setTiposVehiculos(res.data);
        else if (res.data.results) setTiposVehiculos(res.data.results);
      })
      .catch(console.error);
  }, []);

  const fechaActual = new Date();
  const hoy = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      origen,
      destino,
      tipo_vehiculo: tipoVehiculo,
      tipo_carga: `${tipoCarga} - Tonelaje Aproximado: ${tonelaje}`,
      fecha_solicitud: fechaSolicitud
    };

    try {
      await crearSolicitud(data, localStorage.getItem('authToken'));
      setSuccessMessage("Solicitud enviada correctamente. Nuestro equipo la revisará pronto.");
      setError(null);
      setOrigen('');
      setDestino('');
      setTipoVehiculo('');
      setTipoCarga('');
      setFechaSolicitud('');
      setTonelaje('');
    } catch (err) {
      setError("Hubo un problema al procesar la solicitud. Intente nuevamente.");
      setSuccessMessage(null);
    }
  };

  return (
    <div className="vlc-sol-form-container">
      <div className="vlc-sol-form-card">
        <div className="vlc-sol-form-header">
          <h2>Nueva Solicitud de Transporte</h2>
          <p>Complete los detalles del servicio que desea contratar.</p>
        </div>

        <form onSubmit={handleSubmit} className="vlc-sol-form-body">
          <div className="vlc-sol-form-grid">
            <div className="vlc-sol-field full">
              <label>Origen</label>
              <input
                type="text"
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                required
                placeholder="Ciudad o dirección de recogida"
              />
            </div>

            <div className="vlc-sol-field full">
              <label>Destino</label>
              <input
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                required
                placeholder="Ciudad o dirección de entrega"
              />
            </div>

            <div className="vlc-sol-field">
              <label>Tipo de Vehículo</label>
              <select
                value={tipoVehiculo}
                onChange={(e) => setTipoVehiculo(e.target.value)}
                required
              >
                <option value="">Seleccione...</option>
                {tiposVehiculos.map(tipo => (
                  <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>
                ))}
              </select>
            </div>

            <div className="vlc-sol-field">
              <label>Fecha Estimada</label>
              <input
                type="date"
                value={fechaSolicitud}
                onChange={(e) => setFechaSolicitud(e.target.value)}
                required
                min={hoy}
              />
            </div>

            <div className="vlc-sol-field full">
              <label>Descripción de la Carga</label>
              <input
                type="text"
                value={tipoCarga}
                onChange={(e) => setTipoCarga(e.target.value)}
                required
                maxLength={500}
                placeholder="Ej: Material pétreo, sacos de cemento, maquinaria..."
              />
            </div>

            <div className="vlc-sol-field full">
              <label>Tonelaje Aproximado</label>
              <input
                type="text"
                value={tonelaje}
                onChange={(e) => setTonelaje(e.target.value)}
                required
                placeholder="Ej: 10 toneladas"
              />
            </div>
          </div>

          {error && <div className="vlc-sol-alert error">{error}</div>}
          {successMessage && <div className="vlc-sol-alert success">{successMessage}</div>}

          <div className="vlc-sol-form-footer">
            <button type="button" className="vlc-sol-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="vlc-sol-btn-submit">
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SolicitarServicio;