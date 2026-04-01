import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaBox } from 'react-icons/fa';
import './estilos/AdminFinanzas.css';
import './estilos/AdminUsers.css'; 

export default function AdminTiposVehiculos() {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        descripcion: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        cargarTipos();
    }, []);

    const cargarTipos = () => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/tipos/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
        })
            .then(res => {
                if (Array.isArray(res.data)) setTipos(res.data);
                else if (res.data.results) setTipos(res.data.results);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const abrirModal = (tipo = null) => {
        if (tipo) {
            setModoEdicion(true);
            setFormData({ id: tipo.id, nombre: tipo.nombre, descripcion: tipo.descripcion });
        } else {
            setModoEdicion(false);
            setFormData({ id: null, nombre: '', descripcion: '' });
        }
        setErrors({});
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setFormData({ id: null, nombre: '', descripcion: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) {
            setErrors({ nombre: 'El nombre es obligatorio' });
            return;
        }

        const url = modoEdicion
            ? `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/tipos/${formData.id}/`
            : `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/tipos/`;

        const method = modoEdicion ? axios.patch : axios.post;

        method(url, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
        })
            .then(() => {
                alert(modoEdicion ? 'Tipo actualizado' : 'Tipo creado exitosamente');
                cargarTipos();
                cerrarModal();
            })
            .catch(err => {
                console.error(err);
                alert('Error al guardar. Verifique los datos.');
            });
    };

    const handleDelete = (id) => {
        if (!window.confirm('¿Está seguro de eliminar este tipo de vehículo?')) return;

        axios.delete(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/tipos/${id}/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
        })
            .then(() => {
                alert('Eliminado correctamente');
                cargarTipos();
            })
            .catch(err => alert('Error al eliminar'));
    };

    return (
        <div className="vlc-fin-container"> {/* Reusing container class */}
            <div className="vlc-fin-header">
                <h2 className="vlc-fin-title">Gestión de Tipos de Vehículo</h2>
                <p>Administre las categorías de vehículos disponibles en la plataforma.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', marginTop: '10px' }}>
                    <button className="vlc-usr-btn-add" onClick={() => abrirModal()}>
                        <FaPlus /> Nuevo Tipo
                    </button>
                </div>
            </div>

            <div className="vlc-fin-table-wrapper">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>
                ) : (
                    <table className="vlc-fin-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tipos.length === 0 ? (
                                <tr><td colSpan="3" style={{ textAlign: 'center' }}>No hay tipos registrados</td></tr>
                            ) : (
                                tipos.map(t => (
                                    <tr key={t.id}>
                                        <td><strong>{t.nombre}</strong></td>
                                        <td>{t.descripcion || '-'}</td>
                                        <td>
                                            <div className="vlc-fin-actions">
                                                <button className="vlc-usr-icon-btn edit" onClick={() => abrirModal(t)} title="Editar">
                                                    <FaEdit />
                                                </button>
                                                <button className="vlc-usr-icon-btn delete" onClick={() => handleDelete(t.id)} title="Eliminar">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {modalAbierto && (
                <div className="vlc-modal-overlay">
                    <div className="vlc-modal-content">
                        <div className="vlc-modal-header">
                            <h3>{modoEdicion ? 'Editar Tipo' : 'Nuevo Tipo de Vehículo'}</h3>
                            <button className="vlc-modal-close" onClick={cerrarModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="vlc-modal-body">
                                <div className="vlc-group full-width">
                                    <label>Nombre <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Ej: Volqueta, Camión, Grúa..."
                                    />
                                    {errors.nombre && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nombre}</span>}
                                </div>
                                <div className="vlc-group full-width" style={{ marginTop: '15px' }}>
                                    <label>Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        placeholder="Breve descripción del tipo de vehículo..."
                                        style={{ width: '100%', minHeight: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                                    />
                                </div>
                            </div>
                            <div className="vlc-modal-footer">
                                <button type="button" className="vlc-btn-cancel" onClick={cerrarModal}>Cancelar</button>
                                <button type="submit" className="vlc-btn-save">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
