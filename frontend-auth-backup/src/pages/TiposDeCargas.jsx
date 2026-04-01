import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TiposDeCargas.css';

import arenaImg from '../img/arena-fina.jpg';
import gravaImg from '../img/grava.jpeg';
import piedraImg from '../img/piedra.jpeg';
import cementoImg from '../img/cemento.jpeg';
import rellenoImg from '../img/RELLENO.jpeg';
import tierraImg from '../img/TIERRA.jpg';
import lastreImg from '../img/laztre.jpeg';
import hormigonImg from '../img/hormigon.jpeg';

export default function TiposDeCargas() {
  const navigate = useNavigate();

  const cargas = [
    {
      nombre: 'Arena',
      imagen: arenaImg,
      descripcion: 'Material granular usado en construcción. Se utiliza en mezclas de cemento, hormigón y morteros.',
    },
    {
      nombre: 'Grava',
      imagen: gravaImg,
      descripcion: 'Piedras pequeñas usadas como base para pavimentos y en la fabricación de concreto.',
    },
    {
      nombre: 'Piedra',
      imagen: piedraImg,
      descripcion: 'Roca de mayor tamaño empleada en obras de infraestructura pesada y muros de contención.',
    },
    {
      nombre: 'Cemento',
      imagen: cementoImg,
      descripcion: 'Polvo fino que al mezclarse con agua se convierte en una pasta que endurece, usado en toda obra civil.',
    },
    {
      nombre: 'Material de Relleno',
      imagen: rellenoImg,
      descripcion: 'Material no estructural utilizado para nivelar terrenos y cubrir zanjas.',
    },
    {
      nombre: 'Tierra Negra',
      imagen: tierraImg,
      descripcion: 'Tierra fértil usada para jardinería y cultivos en pequeños proyectos.',
    },
    {
      nombre: 'Lastre',
      imagen: lastreImg,
      descripcion: 'Combinación de arena, grava y piedras, ideal para rellenos y bases compactadas en carreteras.',
    },
    {
      nombre: 'Hormigón Premezclado',
      imagen: hormigonImg,
      descripcion: 'Mezcla de cemento, arena, grava y agua, lista para usar en estructuras de concreto armado.',
    },
  ];

  return (
    <div className="vlc-cgs-container">
      <div className="vlc-cgs-header">
        <button className="vlc-cgs-back-btn" onClick={() => navigate('/inicio')}>
          ← Volver al Inicio
        </button>
      </div>

      <h1 className="vlc-cgs-main-title">TIPOS DE CARGAS QUE PUEDES SOLICITAR</h1>

      <div className="vlc-cgs-grid">
        {cargas.map((carga, index) => (
          <div className="vlc-cgs-card" key={index}>
            <div className="vlc-cgs-img-wrapper">
              <img src={carga.imagen} alt={carga.nombre} className="vlc-cgs-img" />
            </div>
            <div className="vlc-cgs-info">
              <h3 className="vlc-cgs-name">{carga.nombre}</h3>
              <p className="vlc-cgs-desc">{carga.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}