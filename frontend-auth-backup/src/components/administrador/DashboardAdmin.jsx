import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  FaSignOutAlt, FaHome, FaUsers, FaFileAlt,
  FaTruck, FaMoneyBillWave, FaChartBar
} from 'react-icons/fa';
import './estilos/DashboardAdmin.css';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard-admin', label: 'Inicio', icon: <FaHome /> },
    { path: '/dashboard-admin/usuarios', label: 'Usuarios', icon: <FaUsers /> },
    { path: '/dashboard-admin/solicitudes', label: 'Solicitudes', icon: <FaFileAlt /> },
    { path: '/dashboard-admin/vehiculos', label: 'Vehículos', icon: <FaTruck /> },
    { path: '/dashboard-admin/finanzas', label: 'Finanzas', icon: <FaMoneyBillWave /> },
    { path: '/dashboard-admin/reportes', label: 'Reportes', icon: <FaChartBar /> },
    { path: '/dashboard-admin/estadisticas', label: 'Viajes', icon: <FaChartBar /> },
  ];

  return (
    <div className="vlc-admin-layout">
      <aside className="vlc-sidebar-container">
        <div className="vlc-sidebar-header">
          <span className="vlc-brand-main">VOLECE</span>
          <span className="vlc-brand-sub">ADMINISTRACIÓN</span>
        </div>

        <nav className="vlc-sidebar-nav">
          <ul className="vlc-nav-menu">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? "vlc-link-item vlc-active" : "vlc-link-item"}
                >
                  <span className="vlc-link-icon">{item.icon}</span>
                  <span className="vlc-link-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="vlc-sidebar-footer">
          <button onClick={handleLogout} className="vlc-logout-btn">
            <FaSignOutAlt /> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="vlc-main-viewport">
        <header className="vlc-main-header">
          <h1>Compañía Volquetas El Cedral <span className="vlc-accent-text">VOLECE.C.A.</span></h1>
        </header>

        <div className="vlc-content-container">
          <div className="vlc-view-card">
            <Outlet />
          </div>
        </div>

        <footer className="vlc-main-footer">
          <p>&copy; 2025 VOLECE C.A. — Gestión de Transporte Pesado</p>
        </footer>
      </main>
    </div>
  );
}