import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaFilePdf, FaEdit, FaTrash } from 'react-icons/fa';
import './estilos/AdminFinanzas.css';

export default function AdminFinanzas() {
  const [movimientos, setMovimientos] = useState([]);
  const [tiposFinanza, setTiposFinanza] = useState([]);
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0 });
  const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '', tipo: '' });
  const [transportistas, setTransportistas] = useState([]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    tipo: '',
    monto: '',
    descripcion: '',
    fecha: '',
    socio: ''
  });

  const token = localStorage.getItem('access');
  const API_URL = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/finanzas/`;

  const cargarDatos = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: filtros
      };

      const [resMov, resBalance, resTipos] = await Promise.all([
        axios.get(`${API_URL}movimientos/`, config),
        axios.get(`${API_URL}balance/`, config),
        axios.get(`${API_URL}tipos/`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setMovimientos(resMov.data.results || resMov.data);
      setResumen(resBalance.data);
      setTiposFinanza(resTipos.data.results || resTipos.data);

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

  useEffect(() => {
    cargarDatos();
    cargarTransportistas();
  }, [filtros]);

  const handleChange = (e) => {
    if (e.target.name === 'monto' && e.target.value < 0) return;
    setNuevoMovimiento({ ...nuevoMovimiento, [e.target.name]: e.target.value });
  };

  const handleEdit = (mov) => {
    setEditingId(mov.id);
    setNuevoMovimiento({
      // mov.tipo is now the ID of the foreign key, which matches the value needed for the select
      tipo: mov.tipo,
      monto: mov.monto,
      descripcion: mov.descripcion,
      fecha: mov.fecha,
      socio: mov.socio || ''
    });
    setMostrarModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que desea eliminar este movimiento?")) return;
    try {
      await axios.delete(`${API_URL}movimientos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Movimiento eliminado');
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setEditingId(null);
    setNuevoMovimiento({ tipo: '', monto: '', descripcion: '', fecha: '', socio: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoMovimiento.tipo) {
      alert("Seleccione un tipo");
      return;
    }

    try {
      if (editingId) {
        // Modo Edición
        await axios.put(
          `${API_URL}movimientos/${editingId}/`,
          nuevoMovimiento,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Movimiento actualizado');
      } else {
        // Modo Creación
        await axios.post(
          `${API_URL}movimientos/`,
          nuevoMovimiento,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Movimiento registrado correctamente');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el movimiento');
    }
  };

  const handleExportarPDF = () => {
    const params = new URLSearchParams(filtros).toString();
    window.open(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/reportes/finanzas-pdf/?${params}`, '_blank');
  };

  return (
    <div className="vlc-fin-container">
      <header className="vlc-fin-header">
        <h2>Gestión Financiera</h2>
      </header>

      <div className="vlc-fin-summary-grid">
        <CardResumen titulo="Ingresos" monto={resumen.ingresos} type="ingreso" />
        <CardResumen titulo="Gastos" monto={resumen.gastos} type="gasto" />
        <CardResumen titulo="Balance Neto" monto={resumen.balance} type="balance" isNegative={resumen.balance < 0} />
      </div>

      <div className="vlc-fin-controls">
        <div className="vlc-fin-filters">
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
            className="vlc-fin-select"
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
          >
            <option value="">Todos los Tipos</option>
            {tiposFinanza.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div className="vlc-fin-actions">
          <button className="vlc-fin-btn vlc-btn-add" onClick={() => {
            setNuevoMovimiento({ tipo: tiposFinanza.length > 0 ? tiposFinanza[0].id : '', monto: '', descripcion: '', fecha: '', socio: '' });
            setMostrarModal(true);
          }}>
            <FaPlus /> Registrar
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
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Socio / Ingreso de</th>
              <th>Registrado Por</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
              <tr><td colSpan="6" className="vlc-fin-empty">No hay movimientos en este rango</td></tr>
            ) : (
              movimientos.map((mov) => (
                <tr key={mov.id}>
                  <td>{mov.fecha}</td>
                  <td>
                    <span className={`vlc-fin-tag ${mov.tipo_nombre === 'Ingreso' ? 'INGRESO' : mov.tipo_nombre === 'Gasto' ? 'GASTO' : 'OTRO'}`}>
                      {mov.tipo_nombre}
                    </span>
                  </td>
                  <td>{mov.descripcion || '-'}</td>
                  <td className="vlc-fin-amount">${mov.monto}</td>
                  <td>{mov.socio_nombre || '-'}</td>
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
            <h3>{editingId ? 'Editar Movimiento' : 'Registrar Movimiento'}</h3>
            <form className="vlc-fin-form" onSubmit={handleSubmit}>

              <div className="vlc-fin-field">
                <label>Tipo de Movimiento:</label>
                <select name="tipo" value={nuevoMovimiento.tipo} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  {tiposFinanza.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              {tiposFinanza.find(t => String(t.id) === String(nuevoMovimiento.tipo))?.nombre === 'Mensualidad' && (
                <div className="vlc-fin-field">
                  <label>Socio / Transportista:</label>
                  <select name="socio" value={nuevoMovimiento.socio} onChange={handleChange} required>
                    <option value="">Seleccione transportista...</option>
                    {transportistas.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="vlc-fin-field">
                <label>Monto o Cantidad:</label>
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
                <label>Fecha:</label>
                <input type="date" name="fecha" value={nuevoMovimiento.fecha} onChange={handleChange} required />
              </div>

              <div className="vlc-fin-field">
                <label>Descripción:</label>
                <input type="text" name="descripcion" placeholder="Ej: Pago Nómina, Flete..." value={nuevoMovimiento.descripcion} onChange={handleChange} />
              </div>

              <div className="vlc-fin-modal-btns">
                <button type="submit" className="vlc-fin-btn-save">Guardar</button>
                <button type="button" className="vlc-fin-btn-cancel" onClick={cerrarModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const CardResumen = ({ titulo, monto, type, isNegative }) => (
  <div className={`vlc-fin-summary-card vlc-fin-card-${type} ${isNegative ? 'vlc-fin-negative' : ''}`}>
    <h4>{titulo}</h4>
    <p>${monto}</p>
  </div>
);