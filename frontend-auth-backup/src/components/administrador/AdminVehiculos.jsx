import React from 'react';
import { Link } from 'react-router-dom';
import { FaList, FaTruck, FaBox } from 'react-icons/fa';
import './estilos/AdminVehiculos.css';

export default function DashboardHome() {
  return (
    <div className="vlc-veh-container">
      <section className="vlc-veh-grid">
        <div className="vlc-veh-card">
          <FaTruck className="vlc-veh-icon" />
          <Link to="registrar-vehiculo" className="vlc-veh-link">
            <h2>Registrar Vehículo</h2>
            <p>Registrar un nuevo vehículo asociado a un transportista</p>
          </Link>
        </div>

        <div className="vlc-veh-card">
          <FaList className="vlc-veh-icon" />
          <Link to="listar-vehiculos" className="vlc-veh-link">
            <h2>Listado de Vehículos</h2>
            <p>Visualice y gestione la flota de vehículos</p>
          </Link>
        </div>

        <div className="vlc-veh-card">
          <FaBox className="vlc-veh-icon" />
          <Link to="gestionar-tipos" className="vlc-veh-link">
            <h2>Gestionar Tipos</h2>
            <p>Añadir y editar tipos de vehículos (Volqueta, Camión, etc.)</p>
          </Link>
        </div>
      </section>
    </div>
  );
}