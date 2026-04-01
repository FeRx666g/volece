import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import './home.css';

export default function TerminosCondiciones() {
    return (
        <div className="vlc-home-master">
            <Navbar />
            <main className="vlc-home-main" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
                <div className="vlc-home-content-width">
                    <h1 className="vlc-home-title">Términos y Condiciones</h1>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                        <p><strong>Última actualización: {new Date().getFullYear()}</strong></p>
                        <br />
                        <h3>1. Aceptación de los términos</h3>
                        <p>Al acceder y utilizar los servicios de VOLECE C.A., usted acepta cumplir con estos Términos y Condiciones. Si no está de acuerdo con alguna parte de los términos, no podrá utilizar nuestros servicios.</p>
                        <br />
                        <h3>2. Servicios de transporte</h3>
                        <p>VOLECE C.A. actúa como un intermediario y proveedor de servicios de logística y transporte de carga pesada. Nos comprometemos a realizar los servicios con la debida diligencia y profesionalismo.</p>
                        <br />
                        <h3>3. Responsabilidades del usuario</h3>
                        <p>El usuario es responsable de proporcionar información precisa sobre la carga, direcciones y horarios. Cualquier costo adicional derivado de información incorrecta será responsabilidad del usuario.</p>
                        <br />
                        <h3>4. Tarifas y Pagos</h3>
                        <p>Las tarifas se calculan en base a la distancia, peso y tipo de carga. Los pagos deben realizarse según las condiciones acordadas en cada contrato o solicitud de servicio.</p>
                        <br />
                        <h3>5. Limitación de responsabilidad</h3>
                        <p>VOLECE C.A. no se hace responsable por retrasos causados por fuerza mayor, condiciones climáticas extremas o situaciones fuera de nuestro control razonable.</p>
                        <br />
                        <h3>6. Modificaciones</h3>
                        <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>
                        <br />
                        <h3>7. Ley aplicable</h3>
                        <p>Estos términos se rigen por las leyes de la República del Ecuador. Cualquier disputa será resuelta en los tribunales competentes de la ciudad de Riobamba.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
