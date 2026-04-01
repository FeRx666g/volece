import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaSignInAlt } from 'react-icons/fa';
import logo from '../../img/LOGO2.png';
import './estilos/AccesoDenegado.css';

const AccesoDenegado = () => {
    const navigate = useNavigate();

    return (
        <div className="vlc-access-denied-container">
            <img src={logo} alt="VOLECE C.A." style={{ width: '200px', marginBottom: '40px' }} />

            <FaLock className="vlc-lock-icon" />

            <h1 className="vlc-access-title">Acceso Restringido</h1>

            <p className="vlc-access-text">
                Para acceder a este panel necesitas haber iniciado sesión.
                Por favor, ingresa con tus credenciales de VOLECE C.A.
            </p>

            <button className="vlc-btn-login-redirect" onClick={() => navigate('/login')}>
                <FaSignInAlt /> Iniciar Sesión
            </button>
        </div>
    );
};

export default AccesoDenegado;
