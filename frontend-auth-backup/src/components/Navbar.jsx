import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../img/LOGO2.png';
import { FaBars } from 'react-icons/fa';
import './estilos/Navbar.css';

export default function Navbar({ onOpenModal }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {menuOpen && <div className="vlc-nav-overlay" onClick={closeMenu}></div>}

      <header className="vlc-nav-main">
        <div className="vlc-nav-container">
          <div className="vlc-nav-brand">
            <img src={logo} alt="Logo" className="vlc-nav-logo" />
            <h2 className="vlc-nav-title">VOLECE C.A.</h2>
          </div>

          <div className="vlc-nav-toggle" onClick={toggleMenu}>
            <FaBars />
          </div>

          <nav className={`vlc-nav-menu ${menuOpen ? 'vlc-active' : ''}`}>
            <ul className="vlc-nav-list">
              <li className="vlc-nav-item">
                <Link to="/inicio" className="vlc-nav-link" onClick={closeMenu}>Inicio</Link>
              </li>
              <li className="vlc-nav-item">
                <a href="#servicios" className="vlc-nav-link" onClick={closeMenu}>Servicios</a>
              </li>
              
              <li className="vlc-nav-dropdown">
                <button className="vlc-nav-dropbtn">Nosotros</button>
                <div className="vlc-nav-dropdown-content">
                    <button onClick={() => { closeMenu(); onOpenModal('historia'); }}>Historia</button>
                    <button onClick={() => { closeMenu(); onOpenModal('mision'); }}>Misión</button>
                    <button onClick={() => { closeMenu(); onOpenModal('vision'); }}>Visión</button>
                    <button onClick={() => { closeMenu(); onOpenModal('valores'); }}>Valores</button>
                </div>
              </li>

              <li className="vlc-nav-item">
                <Link to="/tipos-de-cargas" className="vlc-nav-link" onClick={closeMenu}>Tipos de Cargas</Link>
              </li>
              <li className="vlc-nav-item">
                <a href="#contacto" className="vlc-nav-link" onClick={closeMenu}>Contacto</a>
              </li>
              <li className="vlc-nav-item">
                <Link to="/login" className="vlc-nav-auth-btn" onClick={closeMenu}>Iniciar Sesión</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}