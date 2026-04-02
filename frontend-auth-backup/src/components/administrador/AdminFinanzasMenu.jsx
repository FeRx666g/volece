import React from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import './estilos/AdminVehiculos.css'; // Reutilizamos los estilos del menú de vehículos

export default function AdminFinanzasMenu() {
  return (
    <div className="vlc-veh-container">
      <section className="vlc-veh-grid">
        <div className="vlc-veh-card">
          <FaChartLine className="vlc-veh-icon" />
          <Link to="gestion" className="vlc-veh-link">
            <h2>Gestión y Balance Financiero</h2>
            <p>Reporte de finanzas, resumen de ingresos, gastos y exportación a PDF</p>
          </Link>
        </div>

        <div className="vlc-veh-card">
          <FaMoneyBillWave className="vlc-veh-icon" />
          <Link to="mensualidades" className="vlc-veh-link">
            <h2>Historial de Recibos</h2>
            <p>Registro, edición y visualización del cobro de mensualidades a los transportistas</p>
          </Link>
        </div>

        <div className="vlc-veh-card">
          <FaChartLine className="vlc-veh-icon" style={{color: '#28a745'}}/>
          <Link to="estado-cuenta" className="vlc-veh-link">
            <h2>Estado de Cuenta de Socios</h2>
            <p>Ver y exportar atrasos, deudas, estado financiero global y recibos de pago pendientes</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
