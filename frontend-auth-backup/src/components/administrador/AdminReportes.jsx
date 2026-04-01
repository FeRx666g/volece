import React, { useState } from 'react';
import axios from 'axios';
import { FaUserFriends, FaFileInvoice, FaTruck, FaSearch, FaDownload, FaEye, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import './estilos/ReportesDashboard.css';

const initialFiltros = {
  usuarios: { texto: '', fechaDesde: '', fechaHasta: '' },
  solicitudes: { texto: '', fechaDesde: '', fechaHasta: '', estado: '' },
  vehiculos: { texto: '', fechaDesde: '', fechaHasta: '', estado: '' },
};

const initialPreviewState = {
  usuarios: { data: [], total: null, loading: false, error: null },
  solicitudes: { data: [], total: null, loading: false, error: null },
  vehiculos: { data: [], total: null, loading: false, error: null },
};

const ReportesDashboard = () => {
  const [filtros, setFiltros] = useState(initialFiltros);
  const [previews, setPreviews] = useState(initialPreviewState);
  const token = localStorage.getItem('access');

  const reportes = [
    {
      id: 'usuarios',
      titulo: 'Reporte de Usuarios',
      descripcion: 'Listado completo de personal, conductores y clientes registrados.',
      icono: <FaUserFriends />,
      color: '#4e73df',
      pdfEndpoint: `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/reportes/usuarios/pdf/`,
      previewEndpoint: `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/reportes/usuarios/preview/`,
    },
    {
      id: 'solicitudes',
      titulo: 'Reporte de Solicitudes',
      descripcion: 'Seguimiento de servicios, estados de entrega y rutas activas.',
      icono: <FaFileInvoice />,
      color: '#1cc88a',
      pdfEndpoint: `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/reportes/solicitudes/pdf/`,
      previewEndpoint: `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/reportes/solicitudes/preview/`,
    },
    {
      id: 'vehiculos',
      titulo: 'Reporte de Vehículos',
      descripcion: 'Estado de la flota, documentación y asignación de unidades.',
      icono: <FaTruck />,
      color: '#f6c23e',
      pdfEndpoint: `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/reportes/vehiculos/pdf/`,
      previewEndpoint: `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/reportes/vehiculos/preview/`,
    },
  ];

  const handleChange = (tipo, e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [tipo]: { ...prev[tipo], [name]: value },
    }));
  };

  const handleLimpiar = (tipo) => {
    setFiltros((prev) => ({ ...prev, [tipo]: initialFiltros[tipo] }));
    setPreviews((prev) => ({
      ...prev,
      [tipo]: { data: [], total: null, loading: false, error: null },
    }));
  };

  const getParams = (tipo) => {
    const f = filtros[tipo];
    const params = {};
    if (f.texto) params.search = f.texto;
    if (f.fechaDesde) params.fecha_desde = f.fechaDesde;
    if (f.fechaHasta) params.fecha_hasta = f.fechaHasta;
    if (f.estado) params.estado = f.estado;
    return params;
  };

  const handlePreview = async (reporte) => {
    const { id, previewEndpoint } = reporte;
    setPreviews((prev) => ({
      ...prev,
      [id]: { ...prev[id], loading: true, error: null },
    }));

    try {
      const res = await axios.get(previewEndpoint, {
        params: getParams(id),
        headers: { Authorization: `Bearer ${token}` }
      });

      const listaViajes = res.data.data || res.data.results || [];
      setPreviews((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          data: listaViajes,
          total: res.data.total || (res.data.results ? res.data.count : listaViajes.length),
          loading: false,
          error: null,
        },
      }));
    } catch (err) {
      setPreviews((prev) => ({
        ...prev,
        [id]: { ...prev[id], loading: false, error: 'No se pudo conectar con el servidor.' },
      }));
    }
  };

  const handleDescargar = async (reporte) => {
    const { id, pdfEndpoint } = reporte;
    try {
      const response = await axios.get(pdfEndpoint, {
        params: getParams(id),
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Volece_Reporte_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error al generar el documento PDF.');
    }
  };

  return (
    <div className="report-dashboard">
      <header className="report-header">
        <h1>Centro de Reportes</h1>
        <p>Administre y exporte la información de Volece C.A.</p>
      </header>

      <div className="report-grid">
        {reportes.map((reporte) => {
          const state = previews[reporte.id];
          return (
            <div className="report-card" key={reporte.id}>
              <div className="card-accent" style={{ backgroundColor: reporte.color }}></div>
              <div className="card-main-content">
                <div className="card-info">
                  <div className="card-icon" style={{ color: reporte.color }}>
                    {reporte.icono}
                  </div>
                  <div className="card-text">
                    <h3>{reporte.titulo}</h3>
                    <p>{reporte.descripcion}</p>
                  </div>
                </div>

                <div className="filter-panel">
                  <div className="filter-row">
                    <div className="filter-input-group full">
                      <FaSearch className="inner-icon" />
                      <input
                        type="text"
                        name="texto"
                        placeholder="Buscar por palabra clave..."
                        value={filtros[reporte.id].texto}
                        onChange={(e) => handleChange(reporte.id, e)}
                      />
                    </div>
                  </div>

                  <div className="filter-row">
                    <div className="filter-input-group">
                      <FaCalendarAlt className="inner-icon" />
                      <input
                        type="date"
                        name="fechaDesde"
                        value={filtros[reporte.id].fechaDesde}
                        onChange={(e) => handleChange(reporte.id, e)}
                      />
                    </div>
                    <div className="filter-input-group">
                      <FaCalendarAlt className="inner-icon" />
                      <input
                        type="date"
                        name="fechaHasta"
                        value={filtros[reporte.id].fechaHasta}
                        onChange={(e) => handleChange(reporte.id, e)}
                      />
                    </div>
                  </div>

                  {(reporte.id === 'solicitudes' || reporte.id === 'vehiculos') && (
                    <div className="filter-row">
                      <div className="filter-input-group full">
                        <FaFilter className="inner-icon" />
                        <select
                          name="estado"
                          value={filtros[reporte.id].estado}
                          onChange={(e) => handleChange(reporte.id, e)}
                        >
                          <option value="">Todos los estados</option>
                          {reporte.id === 'solicitudes' ? (
                            <>
                              <option value="pendiente">Pendiente</option>
                              <option value="asignado">Asignado</option>
                              <option value="completado">Completado</option>
                            </>
                          ) : (
                            <>
                              <option value="ACTIVO">Activo</option>
                              <option value="INACTIVO">Inactivo</option>
                              <option value="MANTENIMIENTO">Mantenimiento</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  )}
                  
                  <button className="clear-btn" onClick={() => handleLimpiar(reporte.id)}>
                    Restablecer filtros
                  </button>
                </div>

                <div className="card-actions">
                  <button className="btn-action secondary" onClick={() => handlePreview(reporte)} disabled={state.loading}>
                    {state.loading ? 'Procesando...' : <><FaEye /> Previsualizar</>}
                  </button>
                  <button className="btn-action primary" onClick={() => handleDescargar(reporte)}>
                    <FaDownload /> Generar PDF
                  </button>
                </div>

                {state.error && <div className="error-alert">{state.error}</div>}

                {state.data.length > 0 && (
                  <div className="table-preview-area">
                    <div className="preview-header">
                      <span>Resultados: <strong>{state.total}</strong></span>
                    </div>
                    <div className="scroll-wrapper">
                      <table className="modern-table">
                        <thead>
                          {reporte.id === 'usuarios' && (
                            <tr><th>Nombre</th><th>Cédula</th><th>Email</th></tr>
                          )}
                          {reporte.id === 'solicitudes' && (
                            <tr><th>Cliente</th><th>Origen</th><th>Destino</th><th>Estado</th></tr>
                          )}
                          {reporte.id === 'vehiculos' && (
                            <tr><th>Placa</th><th>Modelo</th><th>Transportista</th></tr>
                          )}
                        </thead>
                        <tbody>
                          {state.data.slice(0, 5).map((item, idx) => (
                            <tr key={idx}>
                              {reporte.id === 'usuarios' && (
                                <>
                                  <td>{item.first_name} {item.last_name}</td>
                                  <td>{item.cedula}</td>
                                  <td>{item.email}</td>
                                </>
                              )}
                              {reporte.id === 'solicitudes' && (
                                <>
                                  <td>{item.cliente_nombre || 'N/A'}</td>
                                  <td>{item.origen}</td>
                                  <td>{item.destino}</td>
                                  <td><span className={`status-tag ${item.estado}`}>{item.estado}</span></td>
                                </>
                              )}
                              {reporte.id === 'vehiculos' && (
                                <>
                                  <td>{item.placa}</td>
                                  <td>{item.vehiculo}</td>
                                  <td>{item.transportista}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {state.total > 5 && <p className="footer-note">Mostrando 5 de {state.total} registros totales.</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportesDashboard;