import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaFilePdf } from 'react-icons/fa';
import './HistorialMantenimientos.css';

export default function HistorialMantenimientos() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [mapaVehiculos, setMapaVehiculos] = useState({});

  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: ''
  });

  const token = localStorage.getItem('access');

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      const [resMantenimientos, resVehiculos] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/transportista/mantenimientos`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/transportista/vehiculo`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setMantenimientos(resMantenimientos.data);

      const listaVehiculos = Array.isArray(resVehiculos.data) ? resVehiculos.data : [resVehiculos.data];
      const mapa = {};
      listaVehiculos.forEach(v => {
        mapa[v.id] = `${v.placa} - ${v.marca}`;
      });
      setMapaVehiculos(mapa);

    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  const handleExportarPDF = async () => {
    try {
      const urlReporte = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/reportes/mantenimientos-pdf/`;

      const response = await axios.get(urlReporte, {
        headers: { Authorization: `Bearer ${token}` },
        params: filtros,
        responseType: 'blob',
      });

      const fechaHoy = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Historial_Mantenimientos_${filtros.fecha_inicio || 'Inicio'}_${filtros.fecha_fin || fechaHoy}.pdf`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      alert('Error al generar PDF. Verifique las fechas.');
    }
  };

  const formatearTipo = (tipo) => {
    const tipos = {
      'CAMBIO_ACEITE': 'Cambio de Aceite',
      'FILTROS': 'Cambio de Filtros',
      'FRENOS': 'Revisión de Frenos',
      'LLANTAS': 'Revisión de Llantas',
      'SUSPENSION': 'Revisión de Suspensión',
      'ELECTRICO': 'Sistema Eléctrico',
      'REFRIGERACION': 'Sistema de Refrigeración',
      'OTRO': 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  const formatearFechaSinAjuste = (fechaString) => {
    if (!fechaString) return '-';
    const [anio, mes, dia] = fechaString.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  const mantenimientosFiltrados = mantenimientos.filter((m) => {
    const fechaM = m.fecha_mantenimiento;
    const { fecha_inicio, fecha_fin } = filtros;

    if (fecha_inicio && fechaM < fecha_inicio) return false;
    if (fecha_fin && fechaM > fecha_fin) return false;

    return true;
  });

  return (
    <div className="vlc-hmn-container">
      <div className="vlc-hmn-card">
        <div className="vlc-hmn-header">
          <div className="vlc-hmn-header-info">
            <h2>Historial de Mantenimientos</h2>
            <p>Registro cronológico de servicios realizados a la flota.</p>
          </div>

          <div className="vlc-hmn-actions">
            <div className="vlc-hmn-date-group">
              <div className="vlc-date-input-wrapper">
                <span className="vlc-date-label">Desde:</span>
                <input
                  type="date"
                  className="vlc-hmn-date-input"
                  value={filtros.fecha_inicio}
                  onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
                />
              </div>
              <div className="vlc-date-input-wrapper">
                <span className="vlc-date-label">Hasta:</span>
                <input
                  type="date"
                  className="vlc-hmn-date-input"
                  value={filtros.fecha_fin}
                  onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
                />
              </div>
            </div>

            <button className="vlc-hmn-btn-pdf" onClick={handleExportarPDF}>
              <FaFilePdf /> Generar PDF
            </button>
          </div>
        </div>

        <div className="vlc-hmn-body">
          {/* USAMOS LA LISTA FILTRADA AQUÍ */}
          {mantenimientosFiltrados.length === 0 ? (
            <div className="vlc-hmn-empty">
              No se han encontrado mantenimientos en el rango seleccionado.
            </div>
          ) : (
            <div className="vlc-hmn-table-wrapper">
              <table className="vlc-hmn-table">
                <thead>
                  <tr>
                    <th>Unidad</th>
                    <th>Tipo de Servicio</th>
                    <th>KM Actual</th>
                    <th>Próximo KM</th>
                    <th>Fecha</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mantenimientosFiltrados.map((m, idx) => (
                    <tr key={idx}>
                      <td className="vlc-hmn-vehicle">
                        <strong>{mapaVehiculos[m.vehiculo] || 'Vehículo no encontrado'}</strong>
                      </td>
                      <td className="vlc-hmn-type">{m.tipo_nombre || m.tipo}</td>
                      <td>{m.kilometraje_actual.toLocaleString()} km</td>
                      <td className="vlc-hmn-next-km">{m.kilometraje_proximo.toLocaleString()} km</td>
                      <td>{formatearFechaSinAjuste(m.fecha_mantenimiento)}</td>
                      <td className="vlc-hmn-obs">{m.observaciones || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}