import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaUndo, FaCheckDouble, FaBan, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import './estilos/AdminSolicitudes.css';

const API_SERVICIOS_URL = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/servicios/`;
const API_USUARIOS_URL = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/`;
const API_ASIGNAR_TURNO_URL = `${API_SERVICIOS_URL}asignar-turno/`;
const API_CREAR_TURNO_URL = `${API_SERVICIOS_URL}solicitudes/crear-turno/`;

const ITEMS_PER_PAGE = 5;

const AdminSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [tiposVehiculos, setTiposVehiculos] = useState([]);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [tempTipo, setTempTipo] = useState('');

  const [autoGenerating, setAutoGenerating] = useState(false);

  const generarTodasLasRecomendaciones = async () => {
    const pendientes = solicitudes.filter(s => s.estado === 'pendiente');

    if (pendientes.length === 0) {
      alert("No hay solicitudes pendientes para generar recomendaciones.");
      return;
    }

    if (!window.confirm(`Se generarán recomendaciones para ${pendientes.length} solicitudes. Esto puede tardar unos segundos. ¿Continuar?`)) {
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('access');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await Promise.all(pendientes.map(async (s) => {
        try {
          await axios.post(
            API_ASIGNAR_TURNO_URL,
            {
              id_solicitud: s.id,
              tipo_vehiculo: s.tipo_vehiculo
            },
            { headers }
          );
        } catch (error) {
        }
      }));

      await fetchSolicitudes();
      alert("Recomendaciones actualizadas correctamente.");

    } catch (err) {
      setError("Error al regenerar recomendaciones masivas.");
    } finally {
      setLoading(false);
    }
  };

  const autoGenerarFaltantes = async (lista, headers) => {
    const faltantes = lista.filter(s => s.estado === 'pendiente' && !s.predicciones.some(p => p.esIA));

    if (faltantes.length === 0) return;

    setAutoGenerating(true);
    try {
      await Promise.all(faltantes.map(s =>
        axios.post(
          API_ASIGNAR_TURNO_URL,
          {
            id_solicitud: s.id,
            tipo_vehiculo: s.tipo_vehiculo
          },
          { headers }
        )
      ));

      await fetchSolicitudes(true);
    } catch (err) {
      setError("Sin conexión al servidor");
    } finally {
      setAutoGenerating(false);
    }
  };

  const fetchSolicitudes = async (skipAutoVal = false) => {
    setLoading(true);
    const token = localStorage.getItem('access');
    if (!token) {
      setError('No estás autenticado');
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await axios.get(`${API_SERVICIOS_URL}solicitudes/`, { headers });
      const listaSolicitudes = res.data.results || res.data;

      const solicitudesProcesadas = await procesarSolicitudes(listaSolicitudes, headers);

      setSolicitudes(solicitudesProcesadas);
      setError(null);

      // if (!skipAutoVal) {
      //   autoGenerarFaltantes(solicitudesProcesadas, headers);
      // }
    } catch (err) {
      setError('Error al cargar solicitudes');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const procesarSolicitudes = async (listaSolicitudes, headers) => {
    try {
      const resTransp = await axios.get(`${API_USUARIOS_URL}transportistas/`, { headers });
      const transportistas = resTransp.data;

      return listaSolicitudes.map((solicitud) => {
        if (solicitud.estado === 'asignado') {
          return {
            ...solicitud,
            predicciones: [],
            selectedUniqueId: null,
          };
        }

        let datosGuardados = solicitud.prediccion_data;

        if (datosGuardados && typeof datosGuardados === 'string') {
          try {
            datosGuardados = JSON.parse(datosGuardados);
          } catch (e) {
          }
        }

        let mejor = datosGuardados?.mejor_transportista || null;
        let listaCompletaN8N = datosGuardados?.lista_completa || null;

        let predicciones = [];

        if (listaCompletaN8N && listaCompletaN8N.length > 0) {
          const ordenada = [...listaCompletaN8N].sort(
            (a, b) => (b.probabilidad || 0) - (a.probabilidad || 0)
          );

          predicciones = ordenada.map((t, index) => {
            const vId = t.vehiculo_id || 'sin_vehiculo';
            const uniqueId = `${t.transportista_id}_${vId}_${index}`;

            return {
              id_unico: uniqueId,
              transportista_id: t.transportista_id,
              transportista_nombre: t.transportista_nombre,
              vehiculo_id: t.vehiculo_id || null,
              vehiculo_info: t.vehiculo_placa ? `${t.vehiculo_placa}` : 'Vehículo no especificado',
              probabilidad: t.probabilidad ?? null,
              comentario: t.comentario_ia || 'Comentario no disponible',
              esIA: mejor && t.transportista_id === mejor.transportista_id && t.vehiculo_id === mejor.vehiculo_id,
            };
          });
        } else if (mejor) {
          const uniqueId = `${mejor.transportista_id}_${mejor.vehiculo_id || 'best'}_0`;
          predicciones = [
            {
              id_unico: uniqueId,
              transportista_id: mejor.transportista_id,
              transportista_nombre: mejor.transportista_nombre,
              vehiculo_id: mejor.vehiculo_id || null,
              vehiculo_info: 'Recomendado IA',
              probabilidad: mejor.probabilidad,
              comentario: 'Recomendación de IA.',
              esIA: true,
            },
            ...transportistas
              .filter((t) => t.id !== mejor.transportista_id)
              .map((t, idx) => ({
                id_unico: `${t.id}_generico_${idx + 1}`,
                transportista_id: t.id,
                transportista_nombre: `${t.nombre} ${t.apellido}`,
                vehiculo_id: null,
                vehiculo_info: 'Sin asignar',
                probabilidad: null,
                comentario: 'Sin comentario',
                esIA: false,
              })),
          ];
        } else {
          predicciones = transportistas.map((t, idx) => ({
            id_unico: `${t.id}_manual_${idx}`,
            transportista_id: t.id,
            transportista_nombre: `${t.nombre} ${t.apellido}`,
            vehiculo_id: null,
            vehiculo_info: 'Sin asignar',
            probabilidad: null,
            comentario: 'Sin comentario',
            esIA: false,
          }));
        }

        const selectedUniqueId = predicciones.length > 0 ? predicciones[0].id_unico : null;

        return {
          ...solicitud,
          predicciones,
          selectedUniqueId,
        };
      });

    } catch (error) {
      return listaSolicitudes.map((s) => ({
        ...s,
        predicciones: [],
        selectedUniqueId: null,
      }));
    }
  };

  const generarRecomendacionIndividual = async (solicitudId, tipoVehiculo) => {
    setUpdatingId(solicitudId);
    const token = localStorage.getItem('access');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.post(
        API_ASIGNAR_TURNO_URL,
        {
          id_solicitud: solicitudId,
          tipo_vehiculo: tipoVehiculo
        },
        { headers }
      );

      await fetchSolicitudes();

    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 500) {
        alert("Sin conexión al servidor por favor");
      } else if (error.code === 'ERR_NETWORK') {
        alert("Sin conexión al servidor por favor");
      } else {
        alert("Error generando recomendación. Verifique la conexión.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const eliminarSolicitud = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta solicitud? Se ocultará del sistema.")) return;

    setUpdatingId(id);
    const token = localStorage.getItem('access');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.patch(`${API_SERVICIOS_URL}solicitudes/${id}/`, { estado_sistema: 'INACTIVO' }, { headers });
      await fetchSolicitudes();
    } catch (err) {
      alert("Error al eliminar la solicitud");
    } finally {
      setUpdatingId(null);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const token = localStorage.getItem('access');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    setUpdatingId(id);
    try {
      const solicitud = solicitudes.find((s) => s.id === id);
      if (!solicitud) throw new Error('Solicitud no encontrada');

      let prediccionSeleccionada = null;
      if (solicitud.selectedUniqueId && solicitud.predicciones) {
        prediccionSeleccionada = solicitud.predicciones.find(p => p.id_unico === solicitud.selectedUniqueId);
      }

      let transportistaId = prediccionSeleccionada?.transportista_id || solicitud.transportista_asignado_id;
      let vehiculoId = prediccionSeleccionada?.vehiculo_id || null;
      let comentarioIA = prediccionSeleccionada?.comentario || null;

      if (['asignado', 'rechazado', 'completado'].includes(nuevoEstado)) {
        const payloadTurno = {
          solicitud_id: id,
          transportista_id: transportistaId,
          vehiculo_id: vehiculoId,
          nuevo_estado: nuevoEstado,
          ...(nuevoEstado === 'asignado' && { comentario_ia: comentarioIA }),
        };

        await axios.post(API_CREAR_TURNO_URL, payloadTurno, { headers });
      } else {
        const payload = { estado: nuevoEstado };
        await axios.patch(`${API_SERVICIOS_URL}solicitudes/${id}/`, payload, {
          headers,
        });
      }

      await fetchSolicitudes();
      setError(null);
    } catch (err) {
      setError('Error al actualizar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const actualizarTipoVehiculo = async (id) => {
    if (!tempTipo) {
      setEditingTypeId(null);
      return;
    }
    setUpdatingId(id);
    const token = localStorage.getItem('access');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.patch(`${API_SERVICIOS_URL}solicitudes/${id}/`,
        { tipo_vehiculo: tempTipo },
        { headers }
      );
      await fetchSolicitudes();
    } catch (err) {
      alert("Error al actualizar tipo de vehículo");
    } finally {
      setUpdatingId(null);
      setEditingTypeId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    fetchSolicitudes();
    fetchTiposVehiculos();
  }, []);

  const fetchTiposVehiculos = async () => {
    const token = localStorage.getItem('access');
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/tipos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) setTiposVehiculos(res.data);
      else if (res.data.results) setTiposVehiculos(res.data.results);
    } catch (err) {
      console.error("Error cargando tipos de vehículos");
    }
  };

  return (
    <div className="vlc-sol-container">
      <div className="vlc-sol-header">
        <div>
          <h2>Gestión de Solicitudes</h2>
          <p>Administración y asignación de transporte</p>
        </div>
        <button
          className="vlc-sol-btn-global-gen"
          onClick={generarTodasLasRecomendaciones}
          disabled={loading}
          style={{
            backgroundColor: '#2563eb', color: 'white', padding: '10px 15px',
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600'
          }}
        >
          {loading ? 'Procesando...' : '↻ Regenerar Todas (IA)'}
        </button>
      </div>

      {loading && <div className="vlc-sol-status-msg">Cargando solicitudes...</div>}
      {error && <div className="vlc-sol-error-msg">{error}</div>}

      <div className="vlc-sol-table-wrapper">
        <table className="vlc-sol-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Origen / Destino</th>
              <th>Detalles</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Asignación (Socio - Unidad)</th>
              <th>Comentario IA</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
              <th style={{ textAlign: 'center' }}>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length === 0 ? (
              <tr><td colSpan="10" className="vlc-sol-empty">No hay solicitudes disponibles</td></tr>
            ) : (
              solicitudes
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((s) => {
                  const esAsignado = s.estado === 'asignado';

                  const opcionSeleccionada = s.predicciones?.find(
                    (p) => p.id_unico === s.selectedUniqueId
                  );

                  const comentarioTexto = (esAsignado ? s.comentario_ia_asignado : (opcionSeleccionada?.comentario || 'Sin comentario')) || '';

                  return (
                    <tr key={s.id}>
                      <td><strong>#{s.id}</strong></td>
                      <td>{s.cliente_nombre || 'N/A'}</td>
                      <td>
                        <div className="vlc-sol-route">
                          <span>{s.origen}</span>
                          <span className="vlc-sol-arrow">→</span>
                          <span>{s.destino}</span>
                        </div>
                      </td>
                      <td>
                        <div className="vlc-sol-details">
                          {editingTypeId === s.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              {tiposVehiculos.length > 0 ? (
                                <select
                                  value={tempTipo}
                                  onChange={(e) => setTempTipo(e.target.value)}
                                  className="vlc-sol-select"
                                  style={{ padding: '2px', fontSize: '0.8rem' }}
                                >
                                  <option value="">Seleccionar</option>
                                  {tiposVehiculos.map((tipo) => (
                                    <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={tempTipo}
                                  onChange={(e) => setTempTipo(e.target.value)}
                                  style={{ width: '100%', padding: '2px', fontSize: '0.8rem' }}
                                />
                              )}
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <FaSave
                                  onClick={() => actualizarTipoVehiculo(s.id)}
                                  style={{ cursor: 'pointer', color: '#16a34a' }}
                                  title="Guardar"
                                />
                                <FaTimes
                                  onClick={() => setEditingTypeId(null)}
                                  style={{ cursor: 'pointer', color: '#dc2626' }}
                                  title="Cancelar"
                                />
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <small>{s.tipo_vehiculo || '-'}</small>
                              {s.estado !== 'asignado' && s.estado !== 'completado' && (
                                <FaEdit
                                  style={{ cursor: 'pointer', color: '#64748b', fontSize: '0.8rem' }}
                                  onClick={() => {
                                    setEditingTypeId(s.id);
                                    setTempTipo(s.tipo_vehiculo || '');
                                  }}
                                  title="Editar Tipo"
                                />
                              )}
                            </div>
                          )}
                          <span>{s.tipo_carga}</span>
                        </div>
                      </td>
                      <td>{s.fecha_solicitud}</td>
                      <td>
                        <span className={`vlc-sol-tag ${s.estado}`}>
                          {s.estado_nombre || s.estado}
                        </span>
                      </td>

                      <td className="vlc-sol-col-select">
                        {esAsignado && s.transportista_asignado_nombre ? (
                          <div className="vlc-sol-assigned-info" style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="vlc-sol-assigned-name" style={{ fontWeight: '700', color: '#1e293b' }}>
                              {s.transportista_asignado_nombre}
                            </span>
                            {s.vehiculo_asignado_placa && (
                              <span className="vlc-sol-assigned-plate" style={{ fontSize: '0.8rem', color: '#279200', fontWeight: '600' }}>
                                Unidad: {s.vehiculo_asignado_placa}
                              </span>
                            )}
                          </div>
                        ) : (
                          esAsignado ? (
                            <div style={{ color: '#dc2626', fontWeight: '600', fontSize: '0.85rem' }}>
                              ⚠ Asignado (Datos faltantes)
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {autoGenerating && s.estado === 'pendiente' && (!s.predicciones || !s.predicciones.some(p => p.esIA)) ? (
                                  <div className="vlc-sol-loading-ai">
                                    <div className="vlc-sol-spinner"></div>
                                    <span>Cargando recomendación...</span>
                                  </div>
                                ) : (
                                  <>
                                    {s.predicciones && s.predicciones.length > 0 && (
                                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <select
                                          className="vlc-sol-select"
                                          value={s.selectedUniqueId || ''}
                                          onChange={(e) => {
                                            const nuevoUniqueId = e.target.value;
                                            const nuevasSolicitudes = solicitudes.map((sol) => {
                                              if (sol.id === s.id) return { ...sol, selectedUniqueId: nuevoUniqueId };
                                              return sol;
                                            });
                                            setSolicitudes(nuevasSolicitudes);
                                          }}
                                          disabled={updatingId === s.id}
                                        >
                                          {s.predicciones.map((pred) => {
                                            const tieneProb = typeof pred.probabilidad === 'number';
                                            const porcentaje = tieneProb ? ` (${Math.round(pred.probabilidad * 100)}%)` : '';
                                            return (
                                              <option key={pred.id_unico} value={pred.id_unico}>
                                                {pred.transportista_nombre} - {pred.vehiculo_info} {porcentaje}
                                              </option>
                                            );
                                          })}
                                        </select>
                                      </div>
                                    )}

                                    <button
                                      className="vlc-sol-btn-generate"
                                      title="Generar/Regenerar recomendación IA"
                                      style={{
                                        backgroundColor: '#4f46e5', // Always blue (primary action) or maybe keep yellow for distinction?
                                        // User wants "same process". Uniformity suggests single color. 
                                        // But maybe 'Reload' implies yellow?
                                        // Let's use the standard primary blue for consistent "Action" look, or yellow if they prefer the 'reload' look.
                                        // The user said "el botón de recargar", which is the yellow one usually.
                                        // But Blue is nicer for "New".
                                        // I'll keep the conditional color for "State Awareness" but Unify the ICON and Text.
                                        // Actually, if I use the icon, it effectively looks like a "Reload" button.
                                        backgroundColor: s.predicciones && s.predicciones.some(p => p.esIA) ? '#facc15' : '#4f46e5',
                                        color: s.predicciones && s.predicciones.some(p => p.esIA) ? 'black' : 'white',
                                        padding: '5px 12px',
                                        borderRadius: '5px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.1rem', // Slightly larger for icon
                                        lineHeight: '1',
                                        whiteSpace: 'nowrap'
                                      }}
                                      onClick={() => generarRecomendacionIndividual(s.id, s.tipo_vehiculo)}
                                      disabled={updatingId === s.id}
                                    >
                                      {updatingId === s.id ? '...' : '↻'}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </td>

                      <td className="vlc-sol-comment-cell">
                        <div className={`vlc-sol-comment-box ${expandedId === s.id ? 'expanded' : ''}`}>
                          {comentarioTexto}
                        </div>
                        {(comentarioTexto || '').length > 60 && (
                          <button className="vlc-sol-read-more" onClick={() => toggleExpand(s.id)}>
                            {expandedId === s.id ? 'Ver menos' : 'Ver más'}
                          </button>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="vlc-sol-actions">
                          <FaCheckCircle
                            className={`vlc-sol-icon-btn approve ${updatingId === s.id ? 'disabled' : ''}`}
                            onClick={() => updatingId !== s.id && cambiarEstado(s.id, 'asignado')}
                            title="Aprobar"
                          />
                          <FaTimesCircle
                            className={`vlc-sol-icon-btn reject ${updatingId === s.id ? 'disabled' : ''}`}
                            onClick={() => updatingId !== s.id && cambiarEstado(s.id, 'rechazado')}
                            title="Rechazar"
                          />
                          <FaCheckDouble
                            className={`vlc-sol-icon-btn complete ${updatingId === s.id ? 'disabled' : ''}`}
                            onClick={() => updatingId !== s.id && cambiarEstado(s.id, 'completado')}
                            title="Completado"
                            style={{ color: '#059669', cursor: 'pointer', marginLeft: '5px' }}
                          />
                          <FaBan
                            className={`vlc-sol-icon-btn cancel ${updatingId === s.id ? 'disabled' : ''}`}
                            onClick={() => updatingId !== s.id && cambiarEstado(s.id, 'cancelado')}
                            title="Cancelar"
                            style={{ color: '#dc2626', cursor: 'pointer', marginLeft: '5px' }}
                          />
                          <FaUndo
                            className={`vlc-sol-icon-btn reset ${updatingId === s.id ? 'disabled' : ''}`}
                            onClick={() => updatingId !== s.id && cambiarEstado(s.id, 'pendiente')}
                            title="Pendiente"
                            style={{ color: '#d97706', cursor: 'pointer', marginLeft: '5px' }}
                          />
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <FaTrash
                          className={`vlc-sol-icon-btn delete ${updatingId === s.id ? 'disabled' : ''}`}
                          onClick={() => updatingId !== s.id && eliminarSolicitud(s.id)}
                          title="Eliminar"
                          style={{ color: '#475569', cursor: 'pointer' }}
                        />
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>

      {solicitudes.length > ITEMS_PER_PAGE && (
        <div className="vlc-sol-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          {(() => {
            const totalPages = Math.ceil(solicitudes.length / ITEMS_PER_PAGE);
            const MAX_VISIBLE = 10;
            const pages = [];

            if (totalPages <= MAX_VISIBLE) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              // Always include first page
              pages.push(1);

              // Calculate start and end of the middle window
              // We want to show roughly 5 pages around current
              let start = Math.max(2, currentPage - 2);
              let end = Math.min(totalPages - 1, currentPage + 2);

              // Adjust if current is near the beginning
              if (currentPage <= 4) {
                end = 7;
              }
              // Adjust if current is near the end
              if (currentPage >= totalPages - 3) {
                start = totalPages - 6;
              }

              // Ellipsis before window
              if (start > 2) {
                pages.push('...');
              }

              for (let i = start; i <= end; i++) {
                pages.push(i);
              }

              // Ellipsis after window
              if (end < totalPages - 1) {
                pages.push('...');
              }

              // Always include last page
              pages.push(totalPages);
            }

            return pages.map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? setCurrentPage(page) : null}
                className={page === currentPage ? 'active' : ''}
                disabled={page === '...'}
                style={page === '...' ? { border: 'none', background: 'transparent', cursor: 'default' } : {}}
              >
                {page}
              </button>
            ));
          })()}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(solicitudes.length / ITEMS_PER_PAGE)))}
            disabled={currentPage === Math.ceil(solicitudes.length / ITEMS_PER_PAGE)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSolicitudes;