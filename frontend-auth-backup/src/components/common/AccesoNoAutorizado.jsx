import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaArrowLeft } from 'react-icons/fa';
import './estilos/AccesoNoAutorizado.css';
import logo from '../../img/LOGO2.png';

const AccesoNoAutorizado = () => {
    const navigate = useNavigate();

    return (
        <div className="vlc-unauth-container">
            <img src={logo} alt="VOLECE C.A." style={{ width: '150px', marginBottom: '30px' }} />

            <FaUserShield className="vlc-ban-icon" />

            <h1 className="vlc-unauth-title">Acceso No Autorizado</h1>

            <p className="vlc-unauth-text">
                Lo sentimos, no tienes los permisos necesarios para acceder a esta sección.
                Si crees que esto es un error, contacta al administrador.
            </p>

            <button className="vlc-btn-back" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Volver Atrás
            </button>
        </div>
    );
};

export default AccesoNoAutorizado;
