import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaFilePdf, FaEdit, FaTrash, FaCog, FaSearch } from 'react-icons/fa';
import './estilos/AdminFinanzas.css';

export default function AdminMensualidades() {
  const [movimientos, setMovimientos] = useState([]);
  const [tiposFinanza, setTiposFinanza] = useState([]);
  const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '', tipo: '', estado_deuda: '', search: '' });
  const [transportistas, setTransportistas] = useState([]);
  const [tarifa, setTarifa] = useState({ actual: 25.00, anterior: null, fecha_modificacion: null });
  const [mostrarModalConfig, setMostrarModalConfig] = useState(false);
  const [nuevaTarifa, setNuevaTarifa] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    tipo: '',
    monto: '25.00',
    descripcion: 'Pago de mensualidad',
    fecha: new Date().toISOString().split('T')[0],
    socio: ''
  });

  const token = localStorage.getItem('access');
  const API_URL = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/finanzas/`;

  const cargarDatos = async () => {
    try {
      const authConfig = { headers: { Authorization: `Bearer ${token}` } };
      
      const resTipos = await axios.get(`${API_URL}tipos/`, authConfig);
      const tipos = resTipos.data.results || resTipos.data;
      setTiposFinanza(tipos);
      
      const tipoMensualidad = tipos.find(t => t.nombre === 'Mensualidad');
      
      if (tipoMensualidad) {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...filtros, tipo: tipoMensualidad.id }
        };
        const resMov = await axios.get(`${API_URL}movimientos/`, config);
        setMovimientos(resMov.data.results || resMov.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const cargarTransportistas = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/transportistas/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransportistas(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarTarifa = async () => {
    try {
      const res = await axios.get(`${API_URL}tarifa/`, { headers: { Authorization: `Bearer ${token}` } });
      setTarifa(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarTransportistas();
    cargarTarifa();
  }, [filtros]);

  const handleChange = (e) => {
    if (e.target.name === 'monto' && e.target.value < 0) return;
    setNuevoMovimiento({ ...nuevoMovimiento, [e.target.name]: e.target.value });
  };

  const handleEdit = (mov) => {
    setEditingId(mov.id);
    setNuevoMovimiento({
      tipo: mov.tipo,
      monto: mov.monto,
      descripcion: mov.descripcion,
      fecha: mov.fecha,
      socio: mov.socio || ''
    });
    setMostrarModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que desea eliminar esta mensualidad?")) return;
    try {
      await axios.delete(`${API_URL}movimientos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Mensualidad eliminada');
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setEditingId(null);
    const tipoMensualidad = tiposFinanza.find(t => t.nombre === 'Mensualidad');
    setNuevoMovimiento({
      tipo: tipoMensualidad ? tipoMensualidad.id : '',
      monto: '25.00',
      descripcion: 'Pago de mensualidad',
      fecha: new Date().toISOString().split('T')[0],
      socio: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tipoMensualidad = tiposFinanza.find(t => t.nombre === 'Mensualidad');
    if (!tipoMensualidad) {
      alert("Error: No existe el tipo de finanza 'Mensualidad'. Por favor créelo en la base de datos.");
      return;
    }

    const payload = {
        ...nuevoMovimiento,
        tipo: tipoMensualidad.id
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}movimientos/${editingId}/`, payload, { headers: { Authorization: `Bearer ${token}` } });
        alert('Mensualidad actualizada');
      } else {
        await axios.post(`${API_URL}movimientos/`, payload, { headers: { Authorization: `Bearer ${token}` } });
        alert('Mensualidad registrada correctamente');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al guardar la mensualidad');
    }
  };

  const handleGuardarTarifa = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}tarifa/`, { monto: nuevaTarifa }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Tarifa actualizada correctamente. Aplicará para las nuevas consultas y cálculos de deuda.');
      setMostrarModalConfig(false);
      cargarTarifa();
      cargarDatos();  // Refresh para que actualice reportes si es el caso
    } catch (error) {
      alert('Error al actualizar tarifa');
    }
  };

  const handleExportarPDF = () => {
    const params = new URLSearchParams(filtros).toString();
    window.open(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/reportes/mensualidades-pdf/?${params}`, '_blank');
  };

  const movimientosFiltrados = movimientos.filter(mov => {
    let matchDeuda = true;
    if (filtros.estado_deuda === 'deuda') matchDeuda = mov.deuda_total > 0;
    if (filtros.estado_deuda === 'aldia') matchDeuda = mov.deuda_total === 0;
    if (filtros.estado_deuda === 'adelantado') matchDeuda = mov.deuda_total < 0;

    let matchSearch = true;
    if (filtros.search) {
      const q = filtros.search.toLowerCase();
      matchSearch = String(mov.socio_nombre).toLowerCase().includes(q) || String(mov.usuario_nombre).toLowerCase().includes(q);
    }
    
    return matchDeuda && matchSearch;
  });

  return (
    <div className="vlc-fin-container">
      <header className="vlc-fin-header">
        <h2>Historial de Recibos</h2>
      </header>

      <div className="vlc-fin-controls">
        <div className="vlc-fin-filters">
          <div style={{display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '5px', padding: '0 10px', border: '1px solid #ced4da'}}>
            <FaSearch style={{color: '#6c757d'}}/>
            <input
              type="text"
              placeholder="Buscar recibos por transportista..."
              style={{border: 'none', padding: '8px', outline: 'none', width: '220px'}}
              value={filtros.search}
              onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
            />
          </div>
          <input
            type="date"
            className="vlc-fin-input"
            onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
          />
          <input
            type="date"
            className="vlc-fin-input"
            onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
          />
          <select
            className="vlc-fin-input"
            value={filtros.estado_deuda}
            onChange={(e) => setFiltros({ ...filtros, estado_deuda: e.target.value })}
          >
            <option value="">Balance (Todos)</option>
            <option value="deuda">Con Deuda</option>
            <option value="aldia">Al Día Exacto</option>
            <option value="adelantado">Adelantados (Fondo a favor)</option>
          </select>
        </div>

        <div className="vlc-fin-actions">
          <button className="vlc-fin-btn vlc-btn-add" style={{backgroundColor: '#007bff'}} onClick={() => {
            const tipoMensualidad = tiposFinanza.find(t => t.nombre === 'Mensualidad');
            setNuevoMovimiento({ tipo: tipoMensualidad ? tipoMensualidad.id : '', monto: tarifa.actual, descripcion: 'Pago de mensualidad', fecha: new Date().toISOString().split('T')[0], socio: '' });
            setMostrarModal(true);
          }}>
            <FaPlus /> Registrar Mensualidad
          </button>
          
          <button className="vlc-fin-btn" style={{backgroundColor: '#6c757d', color: 'white'}} onClick={() => setMostrarModalConfig(true)}>
            <FaCog /> Configuración
          </button>

          <button className="vlc-fin-btn vlc-btn-pdf" onClick={handleExportarPDF}>
            <FaFilePdf /> Reporte PDF
          </button>
        </div>
      </div>

      <div className="vlc-fin-table-wrapper">
        <table className="vlc-fin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Transportista</th>
              <th>Monto Pagado</th>
              <th>Deuda Resultante</th>
              <th>Registrado Por</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.length === 0 ? (
              <tr><td colSpan="6" className="vlc-fin-empty">No hay mensualidades registradas con estos filtros</td></tr>
            ) : (
              movimientosFiltrados.map((mov) => (
                <tr key={mov.id}>
                  <td>{mov.fecha}</td>
                  <td><b>{mov.socio_nombre || 'N/A'}</b></td>
                  <td className="vlc-fin-amount txt-verde">${mov.monto}</td>
                  <td>
                    {mov.deuda_total > 0 ? (
                      <div>
                        <span className="txt-rojo"><b>${mov.deuda_total.toFixed(2)}</b></span>
                        <br/>
                        <span style={{fontSize: '11px', color: '#dc3545'}}>{mov.meses_adeudados} meses atrasados</span>
                      </div>
                    ) : mov.deuda_total < 0 ? (
                      <div>
                        <span className="txt-verde"><b>Adelantado</b></span>
                        <br/>
                        <span style={{fontSize: '11px', color: '#28a745'}}>Saldo a favor: ${Math.abs(mov.deuda_total).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="txt-verde" style={{fontWeight: 'bold'}}>Al día</span>
                    )}
                  </td>
                  <td>{mov.usuario_nombre}</td>
                  <td className="vlc-fin-actions-cell">
                    <button className="vlc-usr-icon-btn edit" onClick={() => handleEdit(mov)} title="Editar">
                      <FaEdit />
                    </button>
                    <button className="vlc-usr-icon-btn delete" onClick={() => handleDelete(mov.id)} title="Eliminar">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {mostrarModal && (
        <div className="vlc-fin-modal-overlay">
          <div className="vlc-fin-modal-card">
            <h3>{editingId ? 'Editar Mensualidad' : 'Registrar Mensualidad'}</h3>
            <form className="vlc-fin-form" onSubmit={handleSubmit}>

              <div className="vlc-fin-field">
                <label>Socio / Transportista:</label>
                <select name="socio" value={nuevoMovimiento.socio} onChange={handleChange} required>
                  <option value="">Seleccione transportista...</option>
                  {transportistas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                  ))}
                </select>
              </div>

              <div className="vlc-fin-field">
                <label>Monto a Pagar:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="monto"
                  placeholder="0.00"
                  value={nuevoMovimiento.monto}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="vlc-fin-field">
                <label>Fecha de Pago:</label>
                <input type="date" name="fecha" value={nuevoMovimiento.fecha} onChange={handleChange} required />
              </div>

              <div className="vlc-fin-field">
                <label>Observación/Nota:</label>
                <input type="text" name="descripcion" placeholder="Mes correspondiente o notas..." value={nuevoMovimiento.descripcion} onChange={handleChange} />
              </div>

              <div className="vlc-fin-modal-btns">
                <button type="submit" className="vlc-fin-btn-save">Guardar</button>
                <button type="button" className="vlc-fin-btn-cancel" onClick={cerrarModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalConfig && (
        <div className="vlc-fin-modal-overlay">
          <div className="vlc-fin-modal-card">
            <h3>Configuración de Mensualidad</h3>
            <p><strong>Tarifa Base Actual:</strong> ${tarifa.actual} <br/> <span style={{fontSize: '11px', color: '#666'}}>(Desde: {tarifa.fecha_modificacion ? new Date(tarifa.fecha_modificacion).toLocaleDateString() : 'Siempre'})</span></p>
            {tarifa.anterior && <p style={{color: '#666', fontSize: '13px', marginTop: '5px'}}>Tarifa Anterior: ${tarifa.anterior}</p>}
            
            <form className="vlc-fin-form" onSubmit={handleGuardarTarifa} style={{marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
              <div className="vlc-fin-field">
                <label>Establecer Nueva Tarifa Mensual:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 30.00"
                  value={nuevaTarifa}
                  onChange={(e) => setNuevaTarifa(e.target.value)}
                  required
                />
              </div>
              <p style={{fontSize: '11px', color: '#d9534f'}}>
                Nota: Esta tarifa se aplicará como la base multiplicadora para calcular deudas desde el momento de registro de cada socio hacia la actualidad.
              </p>
              <div className="vlc-fin-modal-btns">
                <button type="submit" className="vlc-fin-btn-save">Guardar Cambio</button>
                <button type="button" className="vlc-fin-btn-cancel" onClick={() => {setMostrarModalConfig(false); setNuevaTarifa('');}}>Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
