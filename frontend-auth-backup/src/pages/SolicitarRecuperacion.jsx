import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos/SolicitarRecuperacion.css'; 

export default function SolicitarRecuperacion() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/recuperar-password/`, {
        email
      });
      setMensaje(response.data.message || 'Revisa tu correo para restablecer la contraseña.');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar el correo.');
    }
  };

  return (
    <div className="vlc-rec-page">
      <button className="vlc-rec-back-home" onClick={() => navigate('/inicio')}>
        ← Volver al inicio
      </button>

      <div className="vlc-rec-card">
        <form className="vlc-rec-form" onSubmit={handleSubmit}>
          <h1>Recuperar Contraseña</h1>
          <p className="vlc-rec-subtitle">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu acceso.
          </p>

          <div className="vlc-rec-input-group">
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mensaje && <p className="vlc-rec-success">{mensaje}</p>}
          {error && <p className="vlc-rec-error">{error}</p>}

          <button type="submit" className="vlc-rec-btn-main">
            Enviar enlace de recuperación
          </button>

          <p className="vlc-rec-footer-link">
            ¿Ya recordaste tu contraseña?{' '}
            <span onClick={() => navigate('/login')}>
              Inicia sesión aquí
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}