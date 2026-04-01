import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ImageSlider from "../components/ImageSlider";
import Footer from "../components/footer";
import { FaTruck, FaClock, FaShieldAlt, FaMapMarkedAlt, FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import "./home.css";

function NosotrosModales({ visible, onClose }) {
  if (!visible) return null;

  return (
    <div className="vlc-home-modal-overlay" onClick={onClose}>
      <div className="vlc-home-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{visible.toUpperCase()}</h2>
        <div className="vlc-home-modal-body">
          <p>
            {visible === 'historia' && "VOLECE C.A. nació con el objetivo de brindar un servicio de transporte de carga pesada más justo, eficiente y tecnológicamente avanzado. Frente a una industria marcada por procesos manuales, ineficiencia y asignaciones desiguales, esta compañía emergió como una propuesta transformadora en Chimborazo, priorizando la digitalización y la equidad operativa. Desde sus inicios, ha evolucionado constantemente, adaptándose a las necesidades del mercado y apostando por la innovación como motor de cambio."}
            {visible === 'mision' && "Brindar un servicio de transporte pesado seguro, puntual y transparente, optimizando cada operación mediante el uso de tecnologías digitales e inteligencia artificial. En VOLECE C.A., nos comprometemos a satisfacer las necesidades logísticas de nuestros clientes y socios transportistas, asegurando eficiencia operativa, equidad en la asignación de turnos y un manejo financiero confiable."}
            {visible === 'vision' && "Convertirse en la empresa líder a nivel nacional en transporte de carga pesada, reconocida por su excelencia operativa, su enfoque innovador y su compromiso con la equidad, la sostenibilidad y la transformación digital del sector logístico en Ecuador."}
            {visible === 'valores' && "En VOLECE C.A. promovemos la transparencia en cada proceso para garantizar la confianza de nuestros socios y clientes; actuamos con responsabilidad en el cumplimiento de nuestros compromisos operativos; fomentamos la equidad mediante una asignación justa de turnos y oportunidades; impulsamos la innovación integrando tecnologías que optimizan nuestros servicios; y mantenemos un firme compromiso con el cliente, ofreciendo una atención personalizada, eficiente y accesible en cada etapa del servicio."}
          </p>
        </div>
        <button className="vlc-home-btn-primary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleNosotros, setVisibleNosotros] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="vlc-home-master">
      <Navbar onOpenModal={(tipo) => setVisibleNosotros(tipo)} />

      <section className="vlc-home-hero">
        <ImageSlider />
      </section>

      <main className="vlc-home-main">
        <section className="vlc-home-section" id="servicios">
          <div className="vlc-home-content-width">
            <h2 className="vlc-home-title">Nuestros Servicios Especializados</h2>
            <div className="vlc-home-services-grid">
              <ServiceCard icon={<FaTruck />} title="Transporte de Carga" desc="Movemos materiales de construcción, maquinaria y más, de forma segura." />
              <ServiceCard icon={<FaClock />} title="Entrega Puntual" desc="Garantizamos tiempos de entrega eficientes y compromiso con el cliente." />
              <ServiceCard icon={<FaShieldAlt />} title="Seguridad Total" desc="Monitoreo constante y medidas de protección en cada carga transportada." />
              <ServiceCard icon={<FaMapMarkedAlt />} title="Cobertura Nacional" desc="Llegamos a cada rincón del país con rutas planificadas y personal experimentado." />
              <ServiceCard icon={<FaMapMarkedAlt />} title="Gestión de Rutas" desc="Optimizamos cada ruta para ahorrar tiempo y maximizar eficiencia operativa." />
              <ServiceCard icon={<FaFacebookF />} title="Atención Personalizada" desc="Nuestros asesores te acompañan en todo el proceso logístico." />
            </div>
          </div>
        </section>

        <section className="vlc-home-section vlc-home-bg-alt">
          <div className="vlc-home-content-width">
            <h2 className="vlc-home-title">Nuestra Cobertura Nacional</h2>
            <div className="vlc-home-map-frame">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3978.528933130173!2d-78.61589108523878!3d-1.6614642989901307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d2e913ef6b63d5%3A0x9ec009b48077b1ba!2sPenipe%2C%20Chimborazo!5e0!3m2!1ses!2sec!4v1718046519000!5m2!1ses!2sec"
                width="100%"
                height="450"
                loading="lazy"
                title="Mapa cobertura"
              ></iframe>
            </div>
          </div>
        </section>

        <section className="vlc-home-banner">
          <div className="vlc-home-banner-overlay">
            <div className="vlc-home-banner-text">
              <h1>VOLECE C.A. — Transporte Pesado Profesional</h1>
              <p>Más de una década brindando soluciones logísticas seguras, eficientes y a tiempo.</p>
              <a href="/login" className="vlc-home-btn-cta">Cotiza tu Envío Ahora</a>
            </div>
          </div>
        </section>

        <section className="vlc-home-section">
          <div className="vlc-home-content-width">
            <div className="vlc-home-dual-grid">
              <div className="vlc-home-advantages">
                <h2 className="vlc-home-title-left">¿Por qué elegir VOLECE C.A.?</h2>
                <ul className="vlc-home-list">
                  <li>Flota moderna equipada con GPS y sensores.</li>
                  <li>Más de 10 años garantizando entregas seguras.</li>
                  <li>Conductores calificados y rutas optimizadas.</li>
                  <li>Soporte y atención al cliente 24/7.</li>
                </ul>
              </div>
              <div className="vlc-home-stats-grid">
                <StatItem num="+10" label="Años de experiencia" />
                <StatItem num="+500" label="Clientes atendidos" />
                <StatItem num="+1000" label="Viajes realizados" />
              </div>
            </div>
          </div>
        </section>

        <section className="vlc-home-section vlc-home-bg-alt">
          <div className="vlc-home-content-width">
            <h2 className="vlc-home-title">Conoce nuestro trabajo en acción</h2>
            <div className="vlc-home-video-wrapper">
              <video src="/videos/Volece-Trabajo.mp4" autoPlay muted loop playsInline />
            </div>
          </div>
        </section>

        <section className="vlc-home-cta-final" id="contacto">
          <h2>¿Listo para optimizar tu logística?</h2>
          <p>Únete a nuestros clientes satisfechos que ya confían en VOLECE C.A.</p>
          <button className="vlc-home-btn-cta-outline" onClick={() => setShowContactModal(true)}>Contáctanos</button>
        </section>
      </main>

      <a href="https://wa.me/593998521849" className="vlc-home-float-wa" target="_blank" rel="noreferrer">
        <FaWhatsapp />
      </a>

      {showScrollTop && (
        <button className="vlc-home-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
      )}

      <NosotrosModales visible={visibleNosotros} onClose={() => setVisibleNosotros(null)} />

      {showContactModal && (
        <div className="vlc-home-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="vlc-home-modal-card" onClick={e => e.stopPropagation()}>
            <h2>Contáctanos</h2>
            <div className="vlc-home-contact-info">
              <p><strong>Dirección:</strong> Av. Principal barrio Chauzazan, Penipe, Chimborazo.</p>
              <div className="vlc-home-phones">
                <p>📞 +593 998521849 — Gerencia</p>
                <p>📞 +593 990384384 — Presidencia</p>
              </div>
              <div className="vlc-home-socials">
                <a href="#"><FaFacebookF /></a>
                <a href="#"><FaInstagram /></a>
                <a href="#"><FaWhatsapp /></a>
              </div>
            </div>
            <button className="vlc-home-btn-primary" onClick={() => setShowContactModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

      <Footer onContactClick={() => setShowContactModal(true)} />
    </div>
  );
}

const ServiceCard = ({ icon, title, desc }) => (
  <div className="vlc-home-card">
    <div className="vlc-home-card-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const StatItem = ({ num, label }) => (
  <div className="vlc-home-stat-box">
    <h3>{num}</h3>
    <p>{label}</p>
  </div>
);