import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>VOLECE</h2>
      <nav>
        <ul>
          <li><Link to="/cliente/dashboard">Inicio</Link></li>
          <li><Link to="#">Solicitudes</Link></li>
          <li><Link to="#">Historial</Link></li>
          <li><Link to="#">Soporte</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
