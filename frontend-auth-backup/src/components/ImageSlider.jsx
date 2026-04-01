import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import './estilos/ImageSlider.css';

import image1 from '../img/img4.jpg';
import image2 from '../img/imgVol2.jpg';
import image3 from '../img/img3.jpg';
import image4 from '../img/imgVolqueta.jpg';

const ImageSlider = () => {
  const images = [
    { src: image1, text: "Líder en el mercado del transporte pesado" },
    { src: image2, text: "Comprometidos con la puntualidad y la seguridad en cada carga" },
    { src: image3, text: "Tu carga, nuestra responsabilidad: transporte de calidad garantizada" },
    { src: image4, text: "Más de 10 años de experiencia en el transporte de materiales pesados" },
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => {
    setCurrentImage((prevImage) => (prevImage + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prevImage) => (prevImage - 1 + images.length) % images.length);
  };

  return (
    <div className="vlc-sld-main">
      <div className="vlc-sld-wrapper">
        {images.map((image, index) => (
          <div
            key={index}
            className={`vlc-sld-slide ${index === currentImage ? 'vlc-active' : ''}`}
            style={{ backgroundImage: `url(${image.src})` }}
          >
            <div className="vlc-sld-overlay"></div>
            <div className="vlc-sld-content">
              <h2>{image.text}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="vlc-sld-controls">
        <button className="vlc-sld-btn vlc-left" onClick={prevImage}>
          <FaChevronLeft />
        </button>
        <button className="vlc-sld-btn vlc-right" onClick={nextImage}>
          <FaChevronRight />
        </button>
      </div>

      <div className="vlc-sld-dots">
        {images.map((_, index) => (
          <span 
            key={index} 
            className={`vlc-sld-dot ${index === currentImage ? 'vlc-active' : ''}`}
            onClick={() => setCurrentImage(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;