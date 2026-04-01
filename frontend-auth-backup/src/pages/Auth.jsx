import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '', first_name: '', last_name: '',
    email: '', telefono: '', cedula_ruc: '',
    password: '', rol: 'CLIENTE'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  const validarCedulaEcuatoriana = (cedula) => {
    if (!/^\d{10}$/.test(cedula)) return false;
    const digitos = cedula.split('').map(Number);
    const codigoProvincia = parseInt(cedula.substring(0, 2), 10);
    if (codigoProvincia < 1 || codigoProvincia > 24) return false;
    const digitoVerificador = digitos.pop();
    let suma = 0;
    for (let i = 0; i < digitos.length; i++) {
      let valor = digitos[i];
      if (i % 2 === 0) {
        valor *= 2;
        if (valor > 9) valor -= 9;
      }
      suma += valor;
    }
    const resultado = (10 - (suma % 10)) % 10;
    return resultado === digitoVerificador;
  };

  const esContrasenaRobusta = (password) => {
    const minLength = /.{8,}/;
    const mayuscula = /[A-Z]/;
    const minuscula = /[a-z]/;
    const numero = /[0-9]/;
    const especial = /[^A-Za-z0-9]/;
    return minLength.test(password) && mayuscula.test(password) && minuscula.test(password) && numero.test(password) && especial.test(password);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/token/`, loginForm);
      const { access, refresh } = response.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      const perfilResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/perfil/`, {
        headers: { Authorization: `Bearer ${access}` }
      });
      const { rol, first_name, last_name } = perfilResponse.data;
      localStorage.setItem('user_name', `${first_name} ${last_name}`);
      localStorage.setItem('role', rol);
      if (rol === 'ADMIN') navigate('/dashboard-admin');
      else if (rol === 'TRANSP') navigate('/transportista/dashboard');
      else navigate('/cliente/dashboard');
    } catch (err) {
      setError('Nombre de usuario o contraseña incorrectos');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { username, first_name, last_name, email, telefono, cedula_ruc, password } = registerForm;

    if (!username || !first_name || !last_name || !email || !telefono || !cedula_ruc || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (!validarCedulaEcuatoriana(cedula_ruc)) {
      setError('La cédula ingresada no es válida.');
      return;
    }
    if (!esContrasenaRobusta(password)) {
      setError('La contraseña debe ser robusta (8+ caracteres, Mayús, Núm, Especial).');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/registro/`, registerForm);
      setSuccess('Cuenta creada con éxito. Inicia sesión.');
      setIsLogin(true);
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        let mensajes = [];

        const traducir = (msj) => {
          if (typeof msj !== 'string') return msj;
          if (msj.includes('user with that username already exists')) return 'El nombre de usuario ya está en uso.';
          if (msj.includes('user with that cedula_ruc already exists')) return 'Ya existe una cuenta con esta Cédula/RUC.';
          if (msj.includes('user with that email already exists')) return 'Ya existe una cuenta con este correo electrónico.';
          if (msj.includes('This field may not be blank')) return 'Este campo no puede estar vacío.';
          return msj;
        };

        if (data.cedula_ruc) mensajes.push(`Cédula/RUC: ${traducir(data.cedula_ruc.toString())}`);
        if (data.username) mensajes.push(`Usuario: ${traducir(data.username.toString())}`);
        if (data.email) mensajes.push(`Email: ${traducir(data.email.toString())}`);
        if (data.telefono) mensajes.push(`Teléfono: ${traducir(data.telefono.toString())}`);
        if (data.password) mensajes.push(`Contraseña: ${traducir(data.password.toString())}`);

        if (mensajes.length === 0) {
          Object.values(data).forEach(val => {
            let texto = Array.isArray(val) ? val.join(' ') : String(val);
            mensajes.push(traducir(texto));
          });
        }

        setError(mensajes.join(' | '));
      } else {
        setError('Error de conexión o del servidor. Intenta más tarde.');
      }
    }
  };

  return (
    <div className="vlc-auth-page">
      <button className="vlc-auth-back" onClick={() => navigate('/inicio')}>← Volver al Inicio</button>

      <div className={`vlc-auth-container ${!isLogin ? 'vlc-right-active' : ''}`}>

        <div className="vlc-auth-mobile-switch">
          {isLogin ? (
            <>
              <h1>¡Hola de nuevo!</h1>
              <p>Regístrate y comienza a gestionar tus cargas de forma inteligente con VOLECE.</p>
              <button
                type="button"
                className="vlc-auth-btn-ghost"
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              >
                Registrarse
              </button>
            </>
          ) : (
            <>
              <h1>¡Bienvenido!</h1>
              <p>Si ya tienes una cuenta, inicia sesión para continuar con nosotros.</p>
              <button
                type="button"
                className="vlc-auth-btn-ghost"
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              >
                Login
              </button>
            </>
          )}
        </div>

        <div className={`vlc-auth-form-side vlc-signup-side ${!isLogin ? 'vlc-auth-side-active' : ''}`}>
          <form onSubmit={handleRegisterSubmit}>
            <h1>Crear Cuenta</h1>
            <div className="vlc-auth-input-group">
              <input type='text' name='username' placeholder='Usuario' required onChange={handleRegisterChange} />
              <input type='email' name='email' placeholder='Email' required onChange={handleRegisterChange} />
            </div>
            <div className="vlc-auth-input-group">
              <input type='text' name='first_name' placeholder='Nombre' required onChange={handleRegisterChange} />
              <input type='text' name='last_name' placeholder='Apellido' required onChange={handleRegisterChange} />
            </div>
            <div className="vlc-auth-input-group">
              <input type='text' name='telefono' placeholder='Teléfono' maxLength="10" required onChange={handleRegisterChange} />
              <input type='text' name='cedula_ruc' placeholder='Cédula/RUC' maxLength="13" required onChange={handleRegisterChange} />
            </div>
            <input type='password' name='password' placeholder='Contraseña' required onChange={handleRegisterChange} />
            {error && !isLogin && <p className='vlc-auth-error'>{error}</p>}
            {success && <p className='vlc-auth-success'>{success}</p>}
            <button type='submit' className="vlc-auth-btn-main">Registrarse</button>
          </form>
        </div>

        <div className={`vlc-auth-form-side vlc-login-side ${isLogin ? 'vlc-auth-side-active' : ''}`}>
          <form onSubmit={handleLoginSubmit}>
            <h1>Iniciar Sesión</h1>
            <input type='text' name='username' placeholder='Nombre de Usuario' required value={loginForm.username} onChange={handleLoginChange} />
            <input type='password' name='password' placeholder='Contraseña' required value={loginForm.password} onChange={handleLoginChange} />
            <span className="vlc-auth-forgot" onClick={() => navigate('/recuperar-password')}>
              ¿Olvidaste tu contraseña?
            </span>
            {error && isLogin && <p className='vlc-auth-error'>{error}</p>}
            {success && isLogin && <p className='vlc-auth-success'>{success}</p>}
            <button type='submit' className="vlc-auth-btn-main">Entrar</button>
          </form>
        </div>

        <div className="vlc-auth-overlay-side">
          <div className="vlc-auth-overlay">
            <div className="vlc-auth-overlay-panel vlc-overlay-left">
              <h1>¡Bienvenido!</h1>
              <p>Si ya tienes una cuenta, inicia sesión para continuar con nosotros.</p>
              <button className="vlc-auth-btn-ghost" onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}>Login</button>
            </div>
            <div className="vlc-auth-overlay-panel vlc-overlay-right">
              <h1>¡Hola de nuevo!</h1>
              <p>Regístrate y comienza a gestionar tus cargas de forma inteligente con VOLECE.</p>
              <button className="vlc-auth-btn-ghost" onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}>Registrarse</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;