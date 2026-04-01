import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaTruck, FaClipboardList, FaChartBar } from 'react-icons/fa';
import './estilos/DashboardHome.css'; 

export default function DashboardHome() {
  return (
    <div className="vlc-home-wrapper">
      <section className="vlc-cards-grid">
        <div className="vlc-feature-card">
          <FaUsers className="vlc-card-icon" />
          <Link to="usuarios" className="vlc-card-link">
            <h2>Gestión de Usuarios</h2>
            <p>Administra transportistas, clientes y administradores de la plataforma.</p>
          </Link>
        </div>

        <div className="vlc-feature-card">
          <FaClipboardList className="vlc-card-icon" />
          <Link to="solicitudes" className="vlc-card-link">
            <h2>Gestión de Solicitudes</h2>
            <p>Revisa y aprueba las solicitudes de transporte pendientes.</p>
          </Link>
        </div>

        <div className="vlc-feature-card">
          <FaTruck className="vlc-card-icon" />
          <Link to="vehiculos" className="vlc-card-link">
            <h2>Gestión de Vehículos</h2>
            <p>Control de la flota: volquetas, camiones y maquinaria pesada.</p>
          </Link>
        </div>

        <div className="vlc-feature-card">
          <FaChartBar className="vlc-card-icon" />
          <Link to="reportes" className="vlc-card-link">
            <h2>Reportes Estadísticos</h2>
            <p>Analiza el rendimiento y estadísticas globales de VOLECE C.A.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}