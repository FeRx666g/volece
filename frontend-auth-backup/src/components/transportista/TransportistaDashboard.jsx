import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransportistaDashboard.css';
import MantenimientoForm from './MantenimientoForm';
import HistorialMantenimientos from './HistorialMantenimientos';
import ActualizarKilometraje from './ActualizarKilometraje';
import CIcon from '@coreui/icons-react';
import { cilTruck, cilSettings, cilBell, cilHistory, cilAccountLogout, cilSpeedometer } from '@coreui/icons';

export default function TransportistaDashboard() {
  const [listaVehiculos, setListaVehiculos] = useState([]);
  const [vehiculoActual, setVehiculoActual] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vehiculo');

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const token = localStorage.getItem('access');
  const BASE_URL = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}`;

  useEffect(() => {
    fetchVehiculos();
    fetchAlertas();
    fetchAsignaciones();
  }, []);

  const fetchVehiculos = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/vehiculos/transportista/vehiculo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const datos = Array.isArray(response.data) ? response.data : [response.data];
      setListaVehiculos(datos);
      if (datos.length > 0) {
        setVehiculoActual(datos[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertas = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/vehiculos/transportista/alertas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlertas(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAsignaciones = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/servicios/mis-asignaciones/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listaViajes = response.data.results || response.data;
      setAsignaciones(Array.isArray(listaViajes) ? listaViajes : []);
    } catch (error) {
      setAsignaciones([]);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    if (!vehiculoActual) return;
    try {
      await axios.patch(`${BASE_URL}/api/vehiculos/transportista/vehiculo/estado`,
        { vehiculo_id: vehiculoActual.id, estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Estado actualizado a ${nuevoEstado}`);
      fetchVehiculos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const asignacionesFiltradas = asignaciones.filter(turno => {
    if (!fechaInicio && !fechaFin) return true;
    const fechaTurno = new Date(turno.fecha_turno);
    const inicio = fechaInicio ? new Date(fechaInicio) : null;
    const fin = fechaFin ? new Date(fechaFin) : null;

    if (inicio && fechaTurno < inicio) return false;
    if (fin) {
      fin.setHours(23, 59, 59);
      if (fechaTurno > fin) return false;
    }
    return true;
  });

  return (
    <div className="vlc-tra-wrapper">
      <aside className="vlc-tra-sidebar">
        <div className="vlc-tra-logo">
          <h1>VOLECE<span>.CA</span></h1>
        </div>
        <nav className="vlc-tra-nav">
          <div className={`vlc-tra-nav-item ${activeTab === 'vehiculo' ? 'active' : ''}`} onClick={() => setActiveTab('vehiculo')}>
            <CIcon icon={cilTruck} className="vlc-tra-icon" />
            <span>Mis Vehículos</span>
          </div>
          <div className={`vlc-tra-nav-item ${activeTab === 'mantenimientos' ? 'active' : ''}`} onClick={() => setActiveTab('mantenimientos')}>
            <CIcon icon={cilSettings} className="vlc-tra-icon" />
            <span>Mantenimientos</span>
          </div>
          <div className={`vlc-tra-nav-item ${activeTab === 'kilometraje' ? 'active' : ''}`} onClick={() => setActiveTab('kilometraje')}>
            <CIcon icon={cilSpeedometer} className="vlc-tra-icon" />
            <span>Kilometraje</span>
          </div>
          <div className={`vlc-tra-nav-item ${activeTab === 'alertas' ? 'active' : ''}`} onClick={() => setActiveTab('alertas')}>
            <CIcon icon={cilBell} className="vlc-tra-icon" />
            <span>Mis Viajes</span>
          </div>
          <div className={`vlc-tra-nav-item ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
            <CIcon icon={cilHistory} className="vlc-tra-icon" />
            <span>Historial</span>
          </div>
        </nav>
        <div className="vlc-tra-sidebar-footer">
          <div className="vlc-tra-nav-item logout" onClick={handleLogout}>
            <CIcon icon={cilAccountLogout} className="vlc-tra-icon" />
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </aside>

      <main className="vlc-tra-main">
        <header className="vlc-tra-header">
          <h2>Panel del Socio Transportista</h2>
        </header>

        <section className="vlc-tra-content">
          {activeTab === 'vehiculo' && (
            <div className="vlc-tra-fade-in">
              {listaVehiculos.length > 1 && (
                <div className="vlc-tra-selector">
                  <p>Seleccione unidad:</p>
                  <div className="vlc-tra-selector-list">
                    {listaVehiculos.map(v => (
                      <button
                        key={v.id}
                        className={`vlc-tra-sel-btn ${vehiculoActual?.id === v.id ? 'active' : ''}`}
                        onClick={() => setVehiculoActual(v)}
                      >
                        {v.placa} - {v.modelo}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="vlc-tra-loading-container">
                  <p className="vlc-tra-loading">Cargando datos...</p>
                </div>
              ) : vehiculoActual ? (
                <div className="vlc-tra-card-info">
                  <div className="vlc-tra-card-header">
                    <h3>Información de la Unidad</h3>
                    <span className={`vlc-tra-badge ${vehiculoActual.estado}`}>{vehiculoActual.estado}</span>
                  </div>

                  <div className="vlc-tra-detail-layout">
                    <div className="vlc-tra-photo-container">
                      {vehiculoActual.foto ? (
                        <img
                          src={`${BASE_URL}${vehiculoActual.foto}`}
                          alt="Foto Vehículo"
                          className="vlc-tra-vehiculo-img"
                        />
                      ) : (
                        <div className="vlc-tra-no-photo">
                          <CIcon icon={cilTruck} size="3xl" />
                          <p>Sin foto</p>
                        </div>
                      )}
                    </div>

                    <div className="vlc-tra-info-grid">
                      <div className="vlc-tra-info-item"><strong>Placa:</strong> <span>{vehiculoActual.placa}</span></div>
                      <div className="vlc-tra-info-item"><strong>Marca:</strong> <span>{vehiculoActual.marca}</span></div>
                      <div className="vlc-tra-info-item"><strong>Modelo:</strong> <span>{vehiculoActual.modelo}</span></div>
                      <div className="vlc-tra-info-item"><strong>Tipo:</strong> <span>{vehiculoActual.tipo_nombre || vehiculoActual.tipo}</span></div>
                      <div className="vlc-tra-info-item"><strong>Año:</strong> <span>{vehiculoActual.anio}</span></div>
                      <div className="vlc-tra-info-item"><strong>Color:</strong> <span>{vehiculoActual.color}</span></div>
                      <div className="vlc-tra-info-item"><strong>Tonelaje:</strong> <span>{vehiculoActual.tonelaje} t</span></div>
                      <div className="vlc-tra-info-item"><strong>Combustible:</strong> <span>{vehiculoActual.combustible_nombre || vehiculoActual.combustible}</span></div>
                      <div className="vlc-tra-info-item" style={{ gridColumn: '1 / -1', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                        <strong>Estado Actual:</strong>
                        <span style={{
                          marginLeft: '10px',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          backgroundColor: vehiculoActual.estado_nombre?.toUpperCase() === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                          color: vehiculoActual.estado_nombre?.toUpperCase() === 'ACTIVO' ? '#166534' : '#991b1b'
                        }}>
                          {vehiculoActual.estado_nombre || 'Desconocido'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="vlc-tra-state-actions">
                    <p>Actualizar estado operativo:</p>
                    <div className="vlc-tra-btn-group">
                      <button className="vlc-tra-btn active" onClick={() => cambiarEstado('ACTIVO')}>Activo</button>
                      <button className="vlc-tra-btn inactive" onClick={() => cambiarEstado('INACTIVO')}>Inactivo</button>
                      <button className="vlc-tra-btn repair" onClick={() => cambiarEstado('MANTENIMIENTO')}>Mantenimiento</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="vlc-tra-no-data">
                  <CIcon icon={cilTruck} size="4xl" style={{ color: '#ccc', marginBottom: '15px' }} />
                  <h3>No tiene unidades asociadas</h3>
                  <p>Contacte al administrador para registrar su vehículo.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mantenimientos' && <div className="vlc-tra-fade-in"><MantenimientoForm token={token} /></div>}
          {activeTab === 'historial' && <div className="vlc-tra-fade-in"><HistorialMantenimientos /></div>}
          {activeTab === 'kilometraje' && <div className="vlc-tra-fade-in"><ActualizarKilometraje onKilometrajeActualizado={fetchAlertas} /></div>}

          {activeTab === 'alertas' && (
            <div className="vlc-tra-fade-in">
              <div className="vlc-tra-card">
                <h3>Mis Viajes Asignados</h3>

                <div className="vlc-tra-filters" style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Fecha Inicio:</label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Fecha Fin:</label>
                    <input
                      type="date"
                      value={fechaFin}
                      min={fechaInicio}
                      onChange={(e) => setFechaFin(e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  {(fechaInicio || fechaFin) && (
                    <button
                      onClick={() => { setFechaInicio(""); setFechaFin(""); }}
                      style={{ alignSelf: 'flex-end', padding: '8px 15px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: 'bold' }}
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="vlc-tra-table-wrapper">
                  <table className="vlc-tra-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Vehículo</th>
                        <th>Ruta (Origen - Destino)</th>
                        <th>Carga</th>
                        <th>Cliente</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asignacionesFiltradas.length === 0 ? (
                        <tr><td colSpan="7" className="vlc-tra-empty">No se encontraron viajes en este rango</td></tr>
                      ) : (
                        asignacionesFiltradas.map((turno) => (
                          <tr key={turno.id}>
                            <td>#{turno.id}</td>
                            <td>{turno.fecha_turno}</td>

                            <td style={{ fontWeight: 'bold', color: '#279200' }}>
                              {turno.vehiculo_data ? (
                                <span>{turno.vehiculo_data.placa}</span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin Asignar</span>
                              )}
                            </td>

                            <td>
                              <div className="vlc-tra-route">
                                {turno.solicitud_data?.origen} <span className="vlc-tra-arrow">→</span> {turno.solicitud_data?.destino}
                              </div>
                            </td>
                            <td>{turno.solicitud_data?.tipo_carga}</td>
                            <td><strong>{turno.solicitud_data?.cliente_nombre}</strong></td>
                            <td><span className={`vlc-tra-tag ${turno.estado_solicitud}`}>{turno.estado_solicitud}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alertas section removed as per user request */}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}