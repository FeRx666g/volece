import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilList, cilNotes, cilEnvelopeOpen, cilAccountLogout, cilUser, cilLockLocked } from '@coreui/icons'
import { FaWhatsapp, FaTruck, FaHistory, FaBan, FaSave, FaEdit, FaTimes, FaLock } from 'react-icons/fa'
import axios from 'axios'

import './estilos/ClienteDashboard.css'
import './estilos/PerfilCliente.css'
import SolicitarServicio from './Solicitudes/SolicitarServicio'

const API_URL = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/servicios/`

const ClienteDashboard = () => {
  const navigate = useNavigate()
  const [modalVisible, setModalVisible] = useState(false)
  const [view, setView] = useState('dashboard')
  const [solicitudes, setSolicitudes] = useState([])
  const [error, setError] = useState(null)

  const [perfil, setPerfil] = useState({ first_name: '', last_name: '', email: '', telefono: '', cedula_ruc: '' });
  const [modoEdicion, setModoEdicion] = useState(false);

  const [modalPasswordVisible, setModalPasswordVisible] = useState(false);
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });

  const [clienteNombre, setClienteNombre] = useState(localStorage.getItem('user_name') || "Usuario")

  const fetchSolicitudes = async () => {
    const token = localStorage.getItem('access')
    if (!token) {
      setError('No estás autenticado')
      return
    }
    try {
      const res = await axios.get(`${API_URL}solicitudes/mis-solicitudes/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSolicitudes(res.data.results || [])
      setError(null)

      if (clienteNombre === "Usuario") {
        try {
          const perfilRes = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/perfil/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const { first_name, last_name } = perfilRes.data;
          const fullName = `${first_name} ${last_name}`;
          setClienteNombre(fullName);
          localStorage.setItem('user_name', fullName);
        } catch (e) { }
      }

    } catch (err) {
      setError('Error al cargar solicitudes')
    }
  }

  const handleCancelar = async (id) => {
    if (!window.confirm("¿Seguro que quieres cancelar esta solicitud?")) return;
    const token = localStorage.getItem('access');
    try {
      await axios.post(`${API_URL}solicitudes/${id}/cancelar/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Solicitud cancelada');
      fetchSolicitudes();
    } catch (error) {
      alert('No se pudo cancelar la solicitud');
    }
  };



  const fetchPerfil = async () => {
    const token = localStorage.getItem('access');
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/perfil/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerfil(res.data);
    } catch (error) {
      console.error("Error cargando perfil", error);
    }
  };

  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/perfil/`, perfil, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Datos actualizados correctamente');
      setModoEdicion(false);
      const fullName = `${perfil.first_name} ${perfil.last_name}`;
      setClienteNombre(fullName);
      localStorage.setItem('user_name', fullName);
    } catch (error) {
      alert('Error al actualizar datos. Verifique la información.');
      console.error(error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }
    if (passwords.new_password.length < 6) {
      alert('La contraseña nueva debe tener al menos 6 caracteres');
      return;
    }

    const token = localStorage.getItem('access');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/cambiar-password/`,
        { old_password: passwords.old_password, new_password: passwords.new_password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Contraseña actualizada exitosamente');
      setModalPasswordVisible(false);
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      alert(error.response?.data?.error || 'Error al cambiar la contraseña');
    }
  };

  useEffect(() => {
    fetchSolicitudes();
    fetchPerfil();
  }, []);

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="vlc-dash-wrapper">
      <main className="vlc-main-content">
        <header className="vlc-dash-header">
          <div className="vlc-user-info">
            Bienvenido, <strong>{clienteNombre}</strong>
          </div>
        </header>

        <section className="vlc-content-body">
          {!modalVisible ? (
            <>
              {view === 'dashboard' && (
                <div className="vlc-fade-in">
                  <h2 className="vlc-page-title">Dashboard Cliente</h2>
                  <div className="vlc-stats-grid">
                    <div className="vlc-stat-card primary" onClick={() => setModalVisible(true)}>
                      <div className="vlc-stat-info">
                        <span className="vlc-stat-label">Nueva Orden</span>
                        <span className="vlc-stat-value">Solicitar</span>
                        <p className="vlc-stat-desc">Crea una nueva solicitud de transporte de carga.</p>
                      </div>
                      <div className="vlc-stat-icon"><FaTruck /></div>
                    </div>

                    <div className="vlc-stat-card" onClick={() => setView('solicitudes')}>
                      <div className="vlc-stat-info">
                        <span className="vlc-stat-label">Solicitudes Totales</span>
                        <span className="vlc-stat-value">{solicitudes.length}</span>
                        <p className="vlc-stat-desc">Revisa el historial y estado de tus pedidos.</p>
                      </div>
                      <div className="vlc-stat-icon"><FaHistory /></div>
                    </div>

                    <a href="https://wa.me/593998521849" target="_blank" rel="noreferrer" className="vlc-stat-card wa">
                      <div className="vlc-stat-info">
                        <span className="vlc-stat-label">Ayuda Directa</span>
                        <span className="vlc-stat-value">WhatsApp</span>
                        <p className="vlc-stat-desc">Contacta directamente con nuestro equipo de soporte.</p>
                      </div>
                      <div className="vlc-stat-icon"><FaWhatsapp /></div>
                    </a>

                    <div className="vlc-stat-card logout" onClick={handleLogout}>
                      <div className="vlc-stat-info">
                        <span className="vlc-stat-label">Salir</span>
                        <span className="vlc-stat-value">Cerrar Sesión</span>
                        <p className="vlc-stat-desc">Cierra tu sesión actual de forma segura.</p>
                      </div>
                      <div className="vlc-stat-icon"><CIcon icon={cilAccountLogout} /></div>
                    </div>
                  </div>
                </div>
              )}

              {view === 'solicitudes' && (
                <div className="vlc-fade-in">
                  <h2 className="vlc-page-title">Mis Solicitudes</h2>
                  {error && <div className="vlc-error-msg">{error}</div>}
                  <div className="vlc-table-container">
                    <table className="vlc-modern-table">
                      <thead>
                        <tr>
                          <th>Origen</th>
                          <th>Destino</th>
                          <th>Carga</th>
                          <th>Fecha</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudes.length === 0 ? (
                          <tr><td colSpan="6" className="vlc-empty">No hay registros</td></tr>
                        ) : (
                          solicitudes.map((s) => (
                            <tr key={s.id}>
                              <td>{s.origen}</td>
                              <td>{s.destino}</td>
                              <td>{s.tipo_carga}</td>
                              <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                              <td>
                                <span className={`vlc-status-badge ${s.estado.toLowerCase()}`}>
                                  {s.estado_nombre || s.estado}
                                </span>
                              </td>
                              <td>
                                {s.estado && ['pendiente', 'asignado'].includes(s.estado.toLowerCase()) && (
                                  <button
                                    className="vlc-btn-cancel"
                                    onClick={() => handleCancelar(s.id)}
                                    title="Cancelar Solicitud"
                                  >
                                    <FaBan />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {view === 'perfil' && (
                <div className="vlc-fade-in">
                  <h2 className="vlc-page-title">Mis Datos Personales</h2>
                  <div className="vlc-profile-card">
                    <form onSubmit={handleUpdatePerfil}>
                      <div className="vlc-profile-grid">
                        <div className="vlc-input-group">
                          <label>Nombres</label>
                          <input
                            type="text"
                            value={perfil.first_name}
                            disabled={!modoEdicion}
                            onChange={e => setPerfil({ ...perfil, first_name: e.target.value })}
                            className={!modoEdicion ? 'vlc-input-disabled' : ''}
                          />
                        </div>
                        <div className="vlc-input-group">
                          <label>Apellidos</label>
                          <input
                            type="text"
                            value={perfil.last_name}
                            disabled={!modoEdicion}
                            onChange={e => setPerfil({ ...perfil, last_name: e.target.value })}
                            className={!modoEdicion ? 'vlc-input-disabled' : ''}
                          />
                        </div>
                        <div className="vlc-input-group">
                          <label>Cédula / RUC</label>
                          <input
                            type="text"
                            value={perfil.cedula_ruc}
                            disabled={true}
                            className="vlc-input-locked"
                            title="Contacte a soporte para cambiar su identificación"
                          />
                        </div>
                        <div className="vlc-input-group">
                          <label>Teléfono</label>
                          <input
                            type="text"
                            value={perfil.telefono}
                            disabled={!modoEdicion}
                            onChange={e => setPerfil({ ...perfil, telefono: e.target.value })}
                            className={!modoEdicion ? 'vlc-input-disabled' : ''}
                          />
                        </div>
                        <div className="vlc-input-group full-width">
                          <label>Correo Electrónico</label>
                          <input
                            type="email"
                            value={perfil.email}
                            disabled={!modoEdicion}
                            onChange={e => setPerfil({ ...perfil, email: e.target.value })}
                            className={!modoEdicion ? 'vlc-input-disabled' : ''}
                          />
                        </div>
                      </div>

                      <div className="vlc-profile-actions">
                        {!modoEdicion ? (
                          <div className="vlc-profile-action-buttons" style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" className="vlc-btn-password" style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setModalPasswordVisible(true)}>
                              <FaLock /> Cambiar Contraseña
                            </button>
                            <button type="button" className="vlc-btn-edit" onClick={(e) => { e.preventDefault(); setModoEdicion(true); }}>
                              <FaEdit /> Editar Datos
                            </button>
                          </div>
                        ) : (
                          <div className="vlc-edit-buttons">
                            <button type="button" className="vlc-btn-cancel-edit" onClick={() => { setModoEdicion(false); fetchPerfil(); }}>
                              <FaTimes /> Cancelar
                            </button>
                            <button type="submit" className="vlc-btn-save">
                              <FaSave /> Guardar Cambios
                            </button>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="vlc-modal-container vlc-fade-in">
              <SolicitarServicio
                onClose={() => {
                  setModalVisible(false);
                  fetchSolicitudes();
                }}
              />
            </div>
          )}

          {modalPasswordVisible && (
            <div className="vlc-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div className="vlc-modal-content" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <h3 style={{ marginBottom: '20px', color: '#1e293b', textAlign: 'center' }}>Cambiar Contraseña</h3>
                <form onSubmit={handleChangePassword}>
                  <div className="vlc-input-group" style={{ marginBottom: '15px' }}>
                    <label>Contraseña Actual</label>
                    <input type="password" required value={passwords.old_password} onChange={e => setPasswords({ ...passwords, old_password: e.target.value })} />
                  </div>
                  <div className="vlc-input-group" style={{ marginBottom: '15px' }}>
                    <label>Nueva Contraseña</label>
                    <input type="password" required value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} />
                  </div>
                  <div className="vlc-input-group" style={{ marginBottom: '20px' }}>
                    <label>Confirmar Nueva</label>
                    <input type="password" required value={passwords.confirm_password} onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={() => setModalPasswordVisible(false)} style={{ padding: '8px 15px', border: 'none', backgroundColor: '#cbd5e1', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                    <button type="submit" style={{ padding: '8px 15px', border: 'none', backgroundColor: '#279200', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Actualizar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>

      <aside className="vlc-sidebar">
        <div className="vlc-sidebar-logo">
          <h1>VOLECE<span>.CA</span></h1>
        </div>
        <nav className="vlc-nav-menu">
          <div className={`vlc-nav-item ${view === 'dashboard' && !modalVisible ? 'active' : ''}`}
            onClick={() => { setModalVisible(false); setView('dashboard') }}>
            <CIcon icon={cilSpeedometer} className="vlc-icon" />
            <span>Panel de Control</span>
          </div>
          <div className={`vlc-nav-item ${view === 'perfil' ? 'active' : ''}`}
            onClick={() => { setModalVisible(false); setView('perfil') }}>
            <CIcon icon={cilUser} className="vlc-icon" />
            <span>Mis Datos</span>
          </div>
          <div className={`vlc-nav-item ${modalVisible ? 'active' : ''}`}
            onClick={() => { setModalVisible(true); setView('dashboard') }}>
            <CIcon icon={cilList} className="vlc-icon" />
            <span>Solicitar Transporte</span>
          </div>
          <div className={`vlc-nav-item ${view === 'solicitudes' ? 'active' : ''}`}
            onClick={() => { setModalVisible(false); setView('solicitudes') }}>
            <CIcon icon={cilNotes} className="vlc-icon" />
            <span>Mis Solicitudes</span>
          </div>
          <div className="vlc-nav-item" onClick={() => window.open("https://wa.me/593998521849", "_blank")}>
            <CIcon icon={cilEnvelopeOpen} className="vlc-icon" />
            <span>Soporte Técnico</span>
          </div>
        </nav>
        <div className="vlc-sidebar-footer">
          <div className="vlc-nav-item logout" onClick={handleLogout}>
            <CIcon icon={cilAccountLogout} className="vlc-icon" />
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default ClienteDashboard