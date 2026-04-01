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
            <h2>Gestión de Mensualidades</h2>
            <p>Registro y visualización del cobro de mensualidades a los socios transportistas</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
