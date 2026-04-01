import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <h1>Panel del Cliente - VOLECE C.A.</h1>
      <button className="logout-button" onClick={() => {
        localStorage.clear();
        window.location.href = '/login';
      }}>
        Cerrar Sesión
      </button>
    </header>
  );
};

export default Header;
