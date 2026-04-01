import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Auth.css'; 

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/restablecer-password/`, {
        uid,
        token,
        password,
      });

      setMessage('¡Contraseña actualizada con éxito! Serás redirigido...');
      setTimeout(() => navigate('/login'), 3000); // redirige en 3 segundos
    } catch (err) {
      console.error(err);
      setError('Error al restablecer la contraseña. El enlace podría estar expirado.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>Restablecer Contraseña</h2>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}
        <button type="submit">Actualizar contraseña</button>
      </form>
    </div>
  );
}
