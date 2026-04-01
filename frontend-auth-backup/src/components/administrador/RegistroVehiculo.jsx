import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './estilos/RegistroVehiculo.css';

export default function RegistroVehiculo() {
  const [transportistas, setTransportistas] = useState([]);
  const [tiposVehiculos, setTiposVehiculos] = useState([]);
  const [tiposCombustibles, setTiposCombustibles] = useState([]);
  const [formData, setFormData] = useState({
    transportista: '', tipo_vehiculo: '', marca: '', modelo: '',
    placa: '', anio: '', color: '', tonelaje: '', combustible: '',
    numero_motor: '', numero_chasis: '', fecha_adquisicion: '',
    observaciones: '', estado: 'ACTIVO',
    foto: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchTransportistas = axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/usuarios/transportistas/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    });
    const fetchTipos = axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/tipos/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    });
    const fetchCombustibles = axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/tipos-combustible/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    });
    const fetchEstados = axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/estados-vehiculo/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    });

    Promise.all([fetchTransportistas, fetchTipos, fetchCombustibles, fetchEstados])
      .then(axios.spread((transRes, tiposRes, combRes, estRes) => {
        setTransportistas(transRes.data);
        setTiposVehiculos(tiposRes.data.results || tiposRes.data);
        setTiposCombustibles(combRes.data.results || combRes.data);

        const estados = estRes.data.results || estRes.data;
        // setEstados(estados); // If needed globally

        // Set default combustible
        const combustibles = combRes.data.results || combRes.data;
        let defaultCombustible = '';
        if (combustibles.length > 0) {
          defaultCombustible = combustibles[0].id;
        }

        // Set default estado (ACTIVO)
        let defaultEstado = '';
        const estadoActivo = estados.find(e => (e.codigo === 'ACTIVO' || e.nombre.toUpperCase() === 'ACTIVO'));
        if (estadoActivo) {
          defaultEstado = estadoActivo.id;
        } else if (estados.length > 0) {
          defaultEstado = estados[0].id;
        }

        setFormData(prev => ({
          ...prev,
          combustible: defaultCombustible,
          estado: defaultEstado
        }));
      }))
      .catch(err => console.error(err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, foto: file }));
  };

  const validarCampos = () => {
    const nuevosErrores = {};
    const tonelaje = parseFloat(formData.tonelaje);

    if (!formData.tipo_vehiculo) nuevosErrores.tipo_vehiculo = "Seleccione el tipo de vehículo";
    if (!formData.marca) nuevosErrores.marca = "Ingrese la marca";
    if (!formData.placa) nuevosErrores.placa = "Ingrese la placa";
    // Check combustible ID
    if (!formData.combustible) nuevosErrores.combustible = "Seleccione combustible";

    if (isNaN(tonelaje) || tonelaje <= 3.5 || tonelaje > 50)
      nuevosErrores.tonelaje = "Debe estar entre 3.5 y 50 t";

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validarCampos()) return;

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'foto') {
        let val = formData[key];
        if (val !== '' && val !== null && val !== undefined) {
          dataToSend.append(key, val);
        }
      }
    });

    if (formData.foto) {
      dataToSend.append('foto', formData.foto);
    }

    axios.post(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/vehiculos/`, dataToSend, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        alert('Vehículo registrado exitosamente');
        // Reset form but keep defaults if possible, or trigger fetch? 
        // Simpler to just reset and let user reload if they want defaults reset, or just clear non-defaults
        // We will just clear main fields.
        setFormData(prev => ({
          transportista: '', tipo_vehiculo: '', marca: '', modelo: '',
          placa: '', anio: '', color: '', tonelaje: '',
          combustible: prev.combustible, // Keep last selected or default
          numero_motor: '', numero_chasis: '', fecha_adquisicion: '',
          observaciones: '', estado: prev.estado, // Keep default state
          foto: null
        }));
        setErrors({});
      })
      .catch(err => {
        console.error(err);
        if (err.response) {
          const { data, status } = err.response;
          if (status === 400) {
            setErrors(data); // Map backend errors to fields

            // Generate a readable error message
            let msg = 'Error de validación. Por favor revise los campos resaltados.';
            if (data.placa) msg = `Error en Placa: ${data.placa.join(' ')}`;
            else if (data.non_field_errors) msg = data.non_field_errors.join(' ');
            else if (Object.keys(data).length > 0) {
              // Show first error found
              const key = Object.keys(data)[0];
              const val = Array.isArray(data[key]) ? data[key][0] : data[key];
              msg = `Error en ${key}: ${val}`;
            }
            alert(msg);
          } else if (status === 401) {
            alert("Sesión expirada. Por favor inicie sesión nuevamente.");
          } else {
            alert(`Error del servidor (${status}). Intente más tarde.`);
          }
        } else {
          alert('Error de conexión. Verifique su red.');
        }
      });
  };

  return (
    <div className="vlc-reg-container">
      <div className="vlc-reg-card">
        <div className="vlc-reg-header">
          <h2>Registro de Nueva Unidad</h2>
          <p>Ingrese los datos detallados del vehículo para integrarlo a la flota.</p>
        </div>

        <form className="vlc-reg-form" onSubmit={handleSubmit}>

          <div className="vlc-reg-section">
            <h3><span className="vlc-reg-step">1</span> Información de Propiedad</h3>
            <div className="vlc-reg-grid">
              <div className="vlc-reg-group full">
                <label>Socio Transportista</label>
                <select name="transportista" value={formData.transportista} onChange={handleChange}>
                  <option value="">Seleccione un transportista...</option>
                  {transportistas.map(trans => (
                    <option key={trans.id} value={trans.id}>
                      {trans.nombre} {trans.apellido}
                    </option>
                  ))}
                </select>
                {errors.transportista && <span className="vlc-reg-error">{errors.transportista}</span>}
              </div>
            </div>
          </div>

          <div className="vlc-reg-section">
            <h3><span className="vlc-reg-step">2</span> Especificaciones Técnicas</h3>
            <div className="vlc-reg-grid">
              <div className="vlc-reg-group">
                <label>Tipo de Vehículo<span style={{ color: 'red' }}> *</span></label>
                <select name="tipo_vehiculo" value={formData.tipo_vehiculo} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  {tiposVehiculos.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
                {errors.tipo_vehiculo && <span className="vlc-reg-error">{errors.tipo_vehiculo}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Marca<span style={{ color: 'red' }}> *</span></label>
                <input type="text" name="marca" value={formData.marca} onChange={handleChange} required placeholder="Ej: Hino" />
                {errors.marca && <span className="vlc-reg-error">{errors.marca}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Modelo</label>
                <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} placeholder="Ej: GH 500" />
                {errors.modelo && <span className="vlc-reg-error">{errors.modelo}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Placa<span style={{ color: 'red' }}> *</span></label>
                <input type="text" name="placa" value={formData.placa} onChange={handleChange} required placeholder="ABC-1234" />
                {errors.placa && <span className="vlc-reg-error">{errors.placa}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Año de Fabricación</label>
                <input type="number" name="anio" value={formData.anio} onChange={handleChange} />
                {errors.anio && <span className="vlc-reg-error">{errors.anio}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} />
                {errors.color && <span className="vlc-reg-error">{errors.color}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Tonelaje (t)<span style={{ color: 'red' }}> *</span></label>
                <input type="number" step="0.01" name="tonelaje" value={formData.tonelaje} onChange={handleChange} required />
                {errors.tonelaje && <span className="vlc-reg-error">{errors.tonelaje}</span>}
              </div>

              <div className="vlc-reg-group">
                <label>Tipo de Combustible<span style={{ color: 'red' }}> *</span></label>
                <select name="combustible" value={formData.combustible} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  {tiposCombustibles.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="vlc-reg-group full">
                <label>Fotografía del Vehículo</label>
                <input
                  type="file"
                  name="foto"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="vlc-reg-section">
            <h3><span className="vlc-reg-step">3</span> Datos Identificativos y Adicionales</h3>
            <div className="vlc-reg-grid">
              <div className="vlc-reg-group">
                <label>Número de Motor</label>
                <input type="text" name="numero_motor" value={formData.numero_motor} onChange={handleChange} />
              </div>

              <div className="vlc-reg-group">
                <label>Número de Chasis</label>
                <input type="text" name="numero_chasis" value={formData.numero_chasis} onChange={handleChange} />
              </div>

              <div className="vlc-reg-group">
                <label>Fecha de Adquisición</label>
                <input type="date" name="fecha_adquisicion" value={formData.fecha_adquisicion} onChange={handleChange} />
              </div>

              <div className="vlc-reg-group full">
                <label>Observaciones</label>
                <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} placeholder="Detalles adicionales sobre el estado o equipamiento..." />
              </div>
            </div>
          </div>

          <button type="submit" className="vlc-reg-submit">Finalizar Registro</button>
        </form>
      </div>
    </div>
  );
}