import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './estilos/ListadoVehiculos.css';

export default function ListadoVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [tiposVehiculos, setTiposVehiculos] = useState([]);
  const [tiposCombustibles, setTiposCombustibles] = useState([]);
  const [estadosVehiculo, setEstadosVehiculo] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [buscarPlaca, setBuscarPlaca] = useState('');
  const [pagina, setPagina] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [loading, setLoading] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editData, setEditData] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [expandedObservationId, setExpandedObservationId] = useState(null);

  useEffect(() => {
    cargarAuxiliares();
  }, []);

  useEffect(() => {
    cargarVehiculos();
  }, [pagina]);

  const vehiculosFiltrados = (vehiculos ?? []).filter(v => {
    // Use estado (ID) for filtering if filter is ID, or map it.
    return (filtroTipo === '' || v.tipo_vehiculo == filtroTipo) &&
      (filtroEstado === '' || v.estado == filtroEstado) &&
      (buscarPlaca === '' || v.placa.toLowerCase().includes(buscarPlaca.toLowerCase()));
  });

  const totalFilteredPages = Math.ceil(vehiculosFiltrados.length / ITEMS_PER_PAGE);
  const vehiculosPaginados = vehiculosFiltrados.slice(
    (pagina - 1) * ITEMS_PER_PAGE,
    pagina * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPagina(1);
  }, [filtroTipo, filtroEstado, buscarPlaca]);

  const cargarVehiculos = () => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setVehiculos(data);
      })
      .catch(() => setVehiculos([]))
      .finally(() => setLoading(false));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalFilteredPages) {
      setPagina(newPage);
    }
  };

  const cargarAuxiliares = () => {
    const auth = { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } };
    Promise.all([
      axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/transportistas/`, auth),
      axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/tipos/`, auth),
      axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/tipos-combustible/`, auth),
      axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/estados-vehiculo/`, auth)
    ]).then(axios.spread((transRes, tiposRes, combRes, estadosRes) => {
      setTransportistas(transRes.data.results || transRes.data || []);
      setTiposVehiculos(tiposRes.data.results || tiposRes.data || []);
      setTiposCombustibles(combRes.data.results || combRes.data || []);
      setEstadosVehiculo(estadosRes.data.results || estadosRes.data || []);
    })).catch(console.error);
  };

  const handleEstadoChange = (vehiculoId, nuevoEstado) => {
    // Admin uses the standard update endpoint
    axios.patch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/${vehiculoId}/`,
      { estado: nuevoEstado },
      { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
    )
      .then(() => cargarVehiculos())
      .catch((err) => {
        console.error(err);
        alert('Error al actualizar estado');
      });
  };

  const abrirModalEditar = (vehiculo) => {
    const transportistaId = vehiculo.transportista || vehiculo.transportista_detalle?.id || '';
    setEditData({
      id: vehiculo.id,
      transportista: transportistaId,
      tipo: vehiculo.tipo_vehiculo || '',
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      placa: vehiculo.placa,
      anio: vehiculo.anio,
      color: vehiculo.color,
      tonelaje: vehiculo.tonelaje,
      combustible: vehiculo.combustible || '',
      numero_motor: vehiculo.numero_motor || '',
      numero_chasis: vehiculo.numero_chasis || '',
      fecha_adquisicion: vehiculo.fecha_adquisicion || '',
      observaciones: vehiculo.observaciones || '',
      fotoActual: vehiculo.foto,
      nuevaFoto: null
    });
    setPreviewFoto(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditData(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData(prev => ({ ...prev, nuevaFoto: file }));
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const guardarCambios = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('transportista', editData.transportista);
    formData.append('tipo_vehiculo', editData.tipo);
    formData.append('marca', editData.marca);
    formData.append('modelo', editData.modelo);
    formData.append('placa', editData.placa);
    formData.append('anio', editData.anio);
    formData.append('color', editData.color);
    formData.append('tonelaje', editData.tonelaje);
    formData.append('combustible', editData.combustible);

    formData.append('numero_motor', editData.numero_motor);
    formData.append('numero_chasis', editData.numero_chasis);
    formData.append('fecha_adquisicion', editData.fecha_adquisicion);
    formData.append('observaciones', editData.observaciones);

    if (editData.nuevaFoto) {
      formData.append('foto', editData.nuevaFoto);
    }

    axios.patch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/${editData.id}/`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        alert('Vehículo actualizado correctamente');
        cerrarModal();
        cargarVehiculos();
      })
      .catch(() => {
        alert('Error al guardar cambios. Verifique los datos.');
      });
  };





  return (
    <div className="vlc-vls-container">
      <div className="vlc-vls-header">
        <h2 className="vlc-vls-title">Gestión de Flota Vehicular</h2>
        <p>Monitoreo y administración del estado operativo de las unidades.</p>
      </div>

      <div className="vlc-vls-filters-bar">
        <div className="vlc-vls-filter-group">
          <label>Placa</label>
          <input type="text" value={buscarPlaca} onChange={(e) => setBuscarPlaca(e.target.value)} placeholder="Ej: ABC-1234" />
        </div>
        <div className="vlc-vls-filter-group">
          <label>Tipo</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="">Todos</option>
            {tiposVehiculos.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>
        <div className="vlc-vls-filter-group">
          <label>Estado</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            {estadosVehiculo.map(e => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="vlc-vls-table-wrapper">
        {loading ? (
          <div className="vlc-vls-loading">Actualizando registros...</div>
        ) : (
          <table className="vlc-vls-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Marca / Modelo</th>
                <th>Tonelaje</th>
                <th>Socio Transportista</th>
                <th>Observaciones</th>
                <th>Estado Operativo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculosPaginados.length === 0 ? (
                <tr><td colSpan="8" className="vlc-vls-empty">No se encontraron unidades</td></tr>
              ) : (
                vehiculosPaginados.map(vehiculo => (
                  <tr key={vehiculo.id}>
                    <td className="vlc-vls-placa"><strong>{vehiculo.placa}</strong></td>
                    <td>{vehiculo.tipo_nombre || vehiculo.tipo}</td>
                    <td>
                      <div className="vlc-vls-model-info">
                        <span>{vehiculo.marca}</span>
                        <small>{vehiculo.modelo}</small>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{vehiculo.tonelaje} t</td>
                    <td>
                      <span className="vlc-vls-owner">
                        {vehiculo.transportista_detalle
                          ? `${vehiculo.transportista_detalle.first_name || vehiculo.transportista_detalle.nombre || ''} ${vehiculo.transportista_detalle.last_name || vehiculo.transportista_detalle.apellido || ''}`
                          : 'No asignado'}
                      </span>
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px', fontSize: '0.85rem', color: '#64748b' }}>
                        {vehiculo.observaciones && vehiculo.observaciones.length > 50 ? (
                          <>
                            {expandedObservationId === vehiculo.id ? vehiculo.observaciones : `${vehiculo.observaciones.substring(0, 50)}...`}
                            <button
                              onClick={() => setExpandedObservationId(expandedObservationId === vehiculo.id ? null : vehiculo.id)}
                              style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.75rem', marginLeft: '5px' }}
                            >
                              {expandedObservationId === vehiculo.id ? 'Ver menos' : 'Ver más'}
                            </button>
                          </>
                        ) : (
                          vehiculo.observaciones || 'Sin observaciones'
                        )}
                      </div>
                    </td>
                    <td>
                      <select
                        className={`vlc-vls-status-select ${vehiculo.estado_nombre ? vehiculo.estado_nombre.toUpperCase() : 'ACTIVO'}`}
                        value={vehiculo.estado || ''}
                        onChange={(e) => handleEstadoChange(vehiculo.id, e.target.value)}
                      >
                        {estadosVehiculo.map(est => (
                          <option key={est.id} value={est.id}>{est.nombre}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="vlc-vls-btn-edit" onClick={() => abrirModalEditar(vehiculo)}>
                        Editar
                      </button>
                    </td>
                  </tr >
                ))
              )
              }
            </tbody >
          </table >
        )}
      </div >

      <div className="vlc-vls-pagination">
        <button
          onClick={() => handlePageChange(Math.max(pagina - 1, 1))}
          disabled={pagina === 1}
        >
          Anterior
        </button>

        {(() => {
          const totalPages = totalFilteredPages;
          const MAX_VISIBLE = 10;
          const pages = [];

          if (totalPages <= MAX_VISIBLE) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
          } else {
            pages.push(1);
            let start = Math.max(2, pagina - 2);
            let end = Math.min(totalPages - 1, pagina + 2);

            if (pagina <= 4) end = 7;
            if (pagina >= totalPages - 3) start = totalPages - 6;

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
          }

          return pages.map((p, index) => (
            <button
              key={index}
              onClick={() => typeof p === 'number' ? handlePageChange(p) : null}
              disabled={p === '...'}
              className={p === pagina ? 'active' : ''}
              style={p === '...' ? { border: 'none', background: 'transparent', cursor: 'default' } : {}}
            >
              {p}
            </button>
          ));
        })()}

        <button
          onClick={() => handlePageChange(Math.min(pagina + 1, totalFilteredPages))}
          disabled={pagina === totalFilteredPages}
        >
          Siguiente
        </button>
      </div>

      {
        modalAbierto && editData && (
          <div className="vlc-modal-overlay">
            <div className="vlc-modal-content">
              <div className="vlc-modal-header">
                <h3>Editar Vehículo</h3>
                <button onClick={cerrarModal} className="vlc-modal-close">&times;</button>
              </div>
              <form onSubmit={guardarCambios}>
                <div className="vlc-modal-body">
                  <div className="vlc-modal-photo-section">
                    <div className="vlc-photo-preview">
                      {previewFoto ? (
                        <img src={previewFoto} alt="Preview" />
                      ) : editData.fotoActual ? (
                        <img src={`${editData.fotoActual}`} alt="Actual" />
                      ) : (
                        <div className="vlc-no-photo">Sin Foto</div>
                      )}
                    </div>
                    <label className="vlc-file-upload">
                      Cambiar Foto
                      <input type="file" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>

                  <div className="vlc-modal-grid">
                    <div className="vlc-group full-width">
                      <label>Socio Transportista</label>
                      <select
                        name="transportista"
                        value={editData.transportista || ""}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">Seleccione un socio...</option>
                        {transportistas.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.nombre} {t.apellido}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <h4 className="vlc-modal-subtitle">Especificaciones Técnicas</h4>
                  <div className="vlc-modal-grid">
                    <div className="vlc-group">
                      <label>Tipo</label>
                      <select name="tipo" value={editData.tipo} onChange={handleEditChange}>
                        <option value="">Seleccione...</option>
                        {tiposVehiculos.map(t => (
                          <option key={t.id} value={t.id}>{t.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="vlc-group">
                      <label>Combustible</label>
                      <select name="combustible" value={editData.combustible} onChange={handleEditChange}>
                        {tiposCombustibles.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="vlc-group">
                      <label>Marca</label>
                      <input type="text" name="marca" value={editData.marca} onChange={handleEditChange} required />
                    </div>
                    <div className="vlc-group">
                      <label>Modelo</label>
                      <input type="text" name="modelo" value={editData.modelo} onChange={handleEditChange} required />
                    </div>
                    <div className="vlc-group">
                      <label>Placa</label>
                      <input type="text" name="placa" value={editData.placa} onChange={handleEditChange} required />
                    </div>
                    <div className="vlc-group">
                      <label>Año</label>
                      <input type="number" name="anio" value={editData.anio} onChange={handleEditChange} required />
                    </div>
                    <div className="vlc-group">
                      <label>Color</label>
                      <input type="text" name="color" value={editData.color} onChange={handleEditChange} required />
                    </div>
                    <div className="vlc-group">
                      <label>Tonelaje (t)</label>
                      <input type="number" step="0.01" name="tonelaje" value={editData.tonelaje} onChange={handleEditChange} required />
                    </div>
                  </div>

                  <h4 className="vlc-modal-subtitle">Identificación y Detalles</h4>
                  <div className="vlc-modal-grid">
                    <div className="vlc-group">
                      <label>Nº Motor</label>
                      <input type="text" name="numero_motor" value={editData.numero_motor} onChange={handleEditChange} />
                    </div>
                    <div className="vlc-group">
                      <label>Nº Chasis</label>
                      <input type="text" name="numero_chasis" value={editData.numero_chasis} onChange={handleEditChange} />
                    </div>
                    <div className="vlc-group">
                      <label>Fecha Adquisición</label>
                      <input type="date" name="fecha_adquisicion" value={editData.fecha_adquisicion} onChange={handleEditChange} />
                    </div>
                  </div>
                  <div className="vlc-group full-width" style={{ marginTop: '10px' }}>
                    <label>Observaciones</label>
                    <textarea
                      name="observaciones"
                      value={editData.observaciones}
                      onChange={handleEditChange}
                      style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '80px' }}
                    />
                  </div>

                </div>
                <div className="vlc-modal-footer">
                  <button type="button" onClick={cerrarModal} className="vlc-btn-cancel">Cancelar</button>
                  <button type="submit" className="vlc-btn-save">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}