import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaFilter, FaFilePdf, FaSearch } from 'react-icons/fa';
import './estilos/AdminFinanzas.css';

export default function AdminEstadoCuenta() {
  const [estadoCuenta, setEstadoCuenta] = useState([]);
  const [tiposFinanza, setTiposFinanza] = useState([]);
  const [tarifa, setTarifa] = useState({ actual: 25.00 });
  const [filtros, setFiltros] = useState({ estado_deuda: '', search: '' });
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    tipo: '',
    monto: '25.00',
    descripcion: 'Abono / Pago de mensualidad',
    fecha: new Date().toISOString().split('T')[0],
    socio: ''
  });

  const token = localStorage.getItem('access');
  const API_URL = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/finanzas/`;

  const cargarDatos = async () => {
    try {
      const resEstado = await axios.get(`${API_URL}estado_cuenta/`, { headers: { Authorization: `Bearer ${token}` } });
      setEstadoCuenta(resEstado.data);
      
      const resTipos = await axios.get(`${API_URL}tipos/`, { headers: { Authorization: `Bearer ${token}` } });
      setTiposFinanza(resTipos.data.results || resTipos.data);
      
      const resTarifa = await axios.get(`${API_URL}tarifa/`, { headers: { Authorization: `Bearer ${token}` } });
      setTarifa(resTarifa.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const handleChange = (e) => {
    if (e.target.name === 'monto' && e.target.value < 0) return;
    setNuevoMovimiento({ ...nuevoMovimiento, [e.target.name]: e.target.value });
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    const tipoMensualidad = tiposFinanza.find(t => t.nombre === 'Mensualidad');
    setNuevoMovimiento({
      tipo: tipoMensualidad ? tipoMensualidad.id : '',
      monto: tarifa.actual,
      descripcion: 'Abono / Pago de mensualidad',
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

    const payload = { ...nuevoMovimiento, tipo: tipoMensualidad.id };

    try {
      await axios.post(`${API_URL}movimientos/`, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert('Pago registrado correctamente');
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al registrar pago');
    }
  };

  const estadoCuentaFiltrado = estadoCuenta.filter(soc => {
    let matchDeuda = true;
    if (filtros.estado_deuda === 'deuda') matchDeuda = soc.deuda_total > 0;
    if (filtros.estado_deuda === 'aldia') matchDeuda = soc.deuda_total === 0;
    if (filtros.estado_deuda === 'adelantado') matchDeuda = soc.deuda_total < 0;

    let matchSearch = true;
    if (filtros.search) {
      const q = filtros.search.toLowerCase();
      matchSearch = soc.nombre.toLowerCase().includes(q) || soc.cedula.includes(q);
    }
    
    return matchDeuda && matchSearch;
  });

  const handleExportarPDF = () => {
    const params = new URLSearchParams(filtros).toString();
    window.open(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/reportes/estado-cuenta-pdf/?${params}`, '_blank');
  };

  return (
    <div className="vlc-fin-container">
      <header className="vlc-fin-header">
        <h2>Estado de Cuenta (Socios)</h2>
      </header>

      <div className="vlc-fin-controls">
        <div className="vlc-fin-filters">
          <div style={{display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '5px', padding: '0 10px', border: '1px solid #ced4da'}}>
            <FaSearch style={{color: '#6c757d'}}/>
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              style={{border: 'none', padding: '8px', outline: 'none', width: '220px'}}
              value={filtros.search}
              onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
            />
          </div>
          <select
            className="vlc-fin-input"
            value={filtros.estado_deuda}
            onChange={(e) => setFiltros({ ...filtros, estado_deuda: e.target.value })}
          >
            <option value="">Status Financiero (Todos)</option>
            <option value="deuda">En Mora (Con Deuda)</option>
            <option value="aldia">Al Día Exacto</option>
            <option value="adelantado">Adelantados (Fondo a favor)</option>
          </select>
        </div>
        <div className="vlc-fin-actions">
          <button className="vlc-fin-btn vlc-btn-pdf" onClick={handleExportarPDF}>
            <FaFilePdf /> Reporte PDF Filtrado
          </button>
        </div>
      </div>

      <div className="vlc-fin-table-wrapper">
        <table className="vlc-fin-table">
          <thead>
            <tr>
              <th>Transportista / Socio</th>
              <th>Cédula</th>
              <th>Aportes Históricos</th>
              <th>Estado de Cuenta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estadoCuentaFiltrado.length === 0 ? (
              <tr><td colSpan="5" className="vlc-fin-empty">No se encontraron socios con ese estado financiero</td></tr>
            ) : (
              estadoCuentaFiltrado.map((socio) => (
                <tr key={socio.id_socio}>
                  <td><b>{socio.nombre}</b></td>
                  <td>{socio.cedula}</td>
                  <td className="txt-verde">${socio.total_historico_pagado.toFixed(2)}</td>
                  <td>
                    {socio.deuda_total > 0 ? (
                      <div>
                        <span className="txt-rojo"><b>Deuda: ${socio.deuda_total.toFixed(2)}</b></span>
                        <br/>
                        <span style={{fontSize: '11px', color: '#dc3545'}}>{socio.meses_adeudados} meses atrasados</span>
                      </div>
                    ) : socio.deuda_total < 0 ? (
                      <div>
                        <span className="txt-verde"><b>Adelantado</b></span>
                        <br/>
                        <span style={{fontSize: '11px', color: '#28a745'}}>Saldo a favor: ${Math.abs(socio.deuda_total).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="txt-verde" style={{fontWeight: 'bold'}}>Al día (Balance: $0.00)</span>
                    )}
                  </td>
                  <td className="vlc-fin-actions-cell">
                    <button className="vlc-fin-btn" style={{backgroundColor: '#28a745', fontSize: '12px', padding: '5px 10px'}} onClick={() => {
                        const tipoMensualidad = tiposFinanza.find(t => t.nombre === 'Mensualidad');
                        setNuevoMovimiento({ tipo: tipoMensualidad ? tipoMensualidad.id : '', monto: tarifa.actual, descripcion: 'Abono / Pago de mensualidad', fecha: new Date().toISOString().split('T')[0], socio: socio.id_socio });
                        setMostrarModal(true);
                      }}>
                      <FaPlus /> Recibir Pago
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
            <h3>Registrar Pago a Favor de la Cuenta</h3>
            <form className="vlc-fin-form" onSubmit={handleSubmit}>
              <div className="vlc-fin-field">
                <label>Socio Seleccionado:</label>
                <input type="text" value={estadoCuenta.find(s => s.id_socio === nuevoMovimiento.socio)?.nombre || ''} readOnly disabled />
              </div>
              <div className="vlc-fin-field">
                <label>Monto a Pagar/Abonar:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="monto"
                  value={nuevoMovimiento.monto}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="vlc-fin-field">
                <label>Fecha del Pago:</label>
                <input type="date" name="fecha" value={nuevoMovimiento.fecha} onChange={handleChange} required />
              </div>
              <div className="vlc-fin-field">
                <label>Observación/Nota:</label>
                <input type="text" name="descripcion" value={nuevoMovimiento.descripcion} onChange={handleChange} />
              </div>
              <div className="vlc-fin-modal-btns">
                <button type="submit" className="vlc-fin-btn-save">Registrar</button>
                <button type="button" className="vlc-fin-btn-cancel" onClick={cerrarModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
