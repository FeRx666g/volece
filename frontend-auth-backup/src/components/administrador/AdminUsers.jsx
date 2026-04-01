import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './estilos/AdminUsers.css';
import './estilos/AdminSolicitudes.css';

const ITEMS_PER_PAGE = 5;

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filtroRol, setFiltroRol] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: '', first_name: '', last_name: '',
    email: '', cedula_ruc: '', password: '', rol: 'CLIENTE', telefono: ''
  });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const token = localStorage.getItem('access');

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/listar/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(Array.isArray(res.data) ? res.data : res.data.results);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const cargarRoles = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/roles/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) setRoles(res.data);
      else if (res.data.results) setRoles(res.data.results);
    } catch (error) {
      console.error('Error cargando roles:', error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/eliminar/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      cargarUsuarios();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setMostrarModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (usuarioEditando) {
      setUsuarioEditando({ ...usuarioEditando, [name]: value });
    } else {
      setNuevoUsuario({ ...nuevoUsuario, [name]: value });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const url = usuarioEditando
      ? `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/editar/${usuarioEditando.id}/`
      : `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/registro/`;

    const method = usuarioEditando ? 'put' : 'post';
    const data = usuarioEditando
      ? {
        username: usuarioEditando.username,
        first_name: usuarioEditando.first_name,
        last_name: usuarioEditando.last_name,
        email: usuarioEditando.email,
        rol: usuarioEditando.rol,
        cedula_ruc: usuarioEditando.cedula_ruc,
        telefono: usuarioEditando.telefono
      }
      : nuevoUsuario;

    try {
      await axios[method](url, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMostrarModal(false);
      setUsuarioEditando(null);
      cargarUsuarios();
      alert('Operación exitosa');
    } catch (error) {
      if (error.response && error.response.data) {
        let mensaje = '';
        const data = error.response.data;
        if (typeof data === 'object') {
          Object.keys(data).forEach(key => {
            const errorMsg = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
            mensaje += `${key}: ${errorMsg}\n`;
          });
        } else {
          mensaje = String(data);
        }
        alert(mensaje);
      } else {
        alert('Error en la operación');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const usuariosFiltrados = usuarios.filter(u => {
    if (filtroRol === 'TODOS') return true;
    return u.rol === filtroRol;
  });

  const paginatedUsers = usuariosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(usuariosFiltrados.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroRol]);

  return (
    <div className="vlc-usr-container">
      <div className="vlc-usr-header">
        <h2>Gestión de Usuarios</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', width: '100%' }}>
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="TODOS">Todos los roles</option>
            {roles.map(rol => (
              <option key={rol.id} value={rol.codigo}>{rol.nombre}</option>
            ))}
          </select>
          <button className="vlc-usr-btn-add" onClick={() => setMostrarModal(true)}>
            <FaPlus /> Crear Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="vlc-usr-table-wrapper">
        <table className="vlc-usr-table">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.cedula_ruc}</td>
                <td>{u.username}</td>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td>{u.telefono || '-'}</td>
                <td><span className={`vlc-usr-role-tag ${u.rol}`}>{u.rol}</span></td>
                <td>
                  <div className="vlc-usr-actions">
                    <button className="vlc-usr-icon-btn edit" onClick={() => handleEditar(u)}><FaEdit /></button>
                    <button className="vlc-usr-icon-btn delete" onClick={() => handleDelete(u.id)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {usuarios.length > ITEMS_PER_PAGE && (
        <div className="vlc-sol-pagination" style={{ marginTop: '20px' }}>
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          {(() => {
            const totalPages = Math.ceil(usuariosFiltrados.length / ITEMS_PER_PAGE);
            const MAX_VISIBLE = 10;
            const pages = [];

            if (totalPages <= MAX_VISIBLE) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              // Always include first page
              pages.push(1);

              let start = Math.max(2, currentPage - 2);
              let end = Math.min(totalPages - 1, currentPage + 2);

              if (currentPage <= 4) {
                end = 7;
              }
              if (currentPage >= totalPages - 3) {
                start = totalPages - 6;
              }

              if (start > 2) {
                pages.push('...');
              }

              for (let i = start; i <= end; i++) {
                pages.push(i);
              }

              if (end < totalPages - 1) {
                pages.push('...');
              }

              pages.push(totalPages);
            }

            return pages.map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                className={page === currentPage ? 'active' : ''}
                disabled={page === '...'}
                style={page === '...' ? { border: 'none', background: 'transparent', cursor: 'default' } : {}}
              >
                {page}
              </button>
            ));
          })()}

          <button
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {mostrarModal && (
        <div className="vlc-modal-overlay">
          <div className="vlc-modal-card">
            <h3>{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <form className="vlc-modal-form" onSubmit={handleFormSubmit}>
              <div className="vlc-modal-row">
                <div style={{ flex: 1, marginRight: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre</label>
                  <input type="text" name="first_name" placeholder="Nombre" value={usuarioEditando ? usuarioEditando.first_name : nuevoUsuario.first_name} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Apellido</label>
                  <input type="text" name="last_name" placeholder="Apellido" value={usuarioEditando ? usuarioEditando.last_name : nuevoUsuario.last_name} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre de Usuario (Nickname)</label>
                <input type="text" name="username" placeholder="Usuario" value={usuarioEditando ? usuarioEditando.username : nuevoUsuario.username} onChange={handleChange} required style={{ width: '100%' }} />
              </div>

              <div className="vlc-modal-row">
                <div style={{ flex: 1, marginRight: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correo Electrónico</label>
                  <input type="email" name="email" placeholder="Email" value={usuarioEditando ? usuarioEditando.email : nuevoUsuario.email} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Teléfono</label>
                  <input type="text" name="telefono" placeholder="Teléfono" value={usuarioEditando ? (usuarioEditando.telefono || '') : (nuevoUsuario.telefono || '')} onChange={handleChange} style={{ width: '100%' }} />
                </div>
              </div>

              {!usuarioEditando && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contraseña</label>
                  <input type="password" name="password" placeholder="Contraseña" value={nuevoUsuario.password} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cédula / RUC</label>
                <input type="text" name="cedula_ruc" placeholder="Cédula/RUC" value={usuarioEditando ? usuarioEditando.cedula_ruc : nuevoUsuario.cedula_ruc} onChange={handleChange} required style={{ width: '100%' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rol</label>
                <select name="rol" value={usuarioEditando ? usuarioEditando.rol : nuevoUsuario.rol} onChange={handleChange} style={{ width: '100%' }}>
                  {roles.map(rol => (
                    <option key={rol.id} value={rol.codigo}>{rol.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="vlc-modal-btns">
                <button type="submit" className="vlc-modal-btn save">{usuarioEditando ? 'Actualizar' : 'Crear'}</button>
                <button type="button" className="vlc-modal-btn cancel" onClick={() => { setMostrarModal(false); setUsuarioEditando(null); }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
