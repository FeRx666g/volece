import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import './home.css';

export default function PoliticaPrivacidad() {
    return (
        <div className="vlc-home-master">
            <Navbar />
            <main className="vlc-home-main" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
                <div className="vlc-home-content-width">
                    <h1 className="vlc-home-title">Política de Privacidad</h1>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                        <p><strong>Última actualización: {new Date().getFullYear()}</strong></p>
                        <br />
                        <h3>1. Información que recopilamos</h3>
                        <p>En VOLECE C.A., recopilamos información personal que usted nos proporciona voluntariamente al registrarse, solicitar servicios o contactarnos. Esto puede incluir su nombre, dirección, correo electrónico, número de teléfono e información de facturación.</p>
                        <br />
                        <h3>2. Uso de la información</h3>
                        <p>Utilizamos su información para procesar sus solicitudes de transporte, gestionar su cuenta, mejorar nuestros servicios y comunicarnos con usted sobre actualizaciones o promociones relevantes.</p>
                        <br />
                        <h3>3. Protección de datos</h3>
                        <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra el acceso no autorizado, la pérdida o la alteración.</p>
                        <br />
                        <h3>4. Compartir información</h3>
                        <p>No vendemos ni alquilamos su información personal a terceros. Solo compartimos datos con proveedores de servicios esenciales para nuestra operación (como conductores asociados) bajo estrictos acuerdos de confidencialidad.</p>
                        <br />
                        <h3>5. Sus derechos</h3>
                        <p>Usted tiene derecho a acceder, corregir o eliminar su información personal. Puede ejercer estos derechos contactándonos a través de nuestros canales oficiales.</p>
                        <br />
                        <h3>6. Contacto</h3>
                        <p>Si tiene preguntas sobre esta política, por favor contáctenos a través de la sección de contacto en nuestro sitio web.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
