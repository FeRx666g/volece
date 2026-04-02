import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Perfil from "./pages/perfil";
import { Navigate } from "react-router-dom";
import './App.css';
import Home from './pages/home';
import ClienteDashboard from './components/cliente/ClienteDashboard';
import Auth from "./pages/Auth";

//componentes de cliente

import SolicitarServicio from './components/cliente/Solicitudes/SolicitarServicio';
import SolicitudesList from './components/cliente/Solicitudes/SolicitudesList';

//componentes de administrador
import DashboardAdmin from './components/administrador/DashboardAdmin';
import AdminUsers from './components/administrador/AdminUsers';
/* compnonentes de finanzas administrador
import AdminFinanzas from './components/administrador/FinancieroList';
import Mensualidades from './components/administrador/FormularioCuota';
import ListadoCuotas from "./components/administrador/ListadoCuotas";*/

import AdminVehiculos from './components/administrador/AdminVehiculos';
import AdminReportes from './components/administrador/AdminReportes';
import AdminSolicitudes from './components/administrador/AdminSolicitudes';
import DashboardHome from './components/administrador/DashboardHome';
import RecuperarPassword from './pages/RecuperarPassword';
import SolicitarRecuperacion from './pages/SolicitarRecuperacion';
import RegistroVehiculo from './components/administrador/RegistroVehiculo';
import ListadoVehiculos from './components/administrador/ListadoVehiculos';
import AdminTiposVehiculos from './components/administrador/AdminTiposVehiculos';
import AdminFinanzasMenu from './components/administrador/AdminFinanzasMenu';
import AdminFinanzas from './components/administrador/AdminFinanzas';
import AdminMensualidades from './components/administrador/AdminMensualidades';
import AdminEstadoCuenta from './components/administrador/AdminEstadoCuenta';
import AdminEstadisticas from './components/administrador/AdminEstadisticas';
// componentes página de inicio
import TiposDeCargas from './pages/TiposDeCargas';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import TerminosCondiciones from './pages/TerminosCondiciones';


//componentes de transportista
import TransportistaDashboard from './components/transportista/TransportistaDashboard.jsx';
import RequireAuth from './components/common/RequireAuth';
import RequireRole from './components/common/RequireRole';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>

          <Route path="/tipos-de-cargas" element={<TiposDeCargas />} />
          <Route path="/privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos" element={<TerminosCondiciones />} />

          <Route path="/" element={<Navigate to="/inicio" />} />
          <Route path="/inicio" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/perfil" element={<Perfil />} />

          {/* Rutas de cliente */}
          <Route path="/cliente/dashboard" element={<RequireRole allowedRoles={['CLIENTE']}><ClienteDashboard /></RequireRole>} />
          <Route path="/cliente/solicitar-servicio" element={<RequireRole allowedRoles={['CLIENTE']}><SolicitarServicio /></RequireRole>} />
          <Route path="/cliente/mis-solicitudes" element={<RequireRole allowedRoles={['CLIENTE']}><SolicitudesList /></RequireRole>} />

          {/* Rutas de transportista*/}
          <Route path="/transportista/dashboard" element={<RequireRole allowedRoles={['TRANSP']}><TransportistaDashboard /></RequireRole>} />

          {/* Rutas de administrador*/}
          <Route path="/dashboard-admin" element={<RequireRole allowedRoles={['ADMIN']}><DashboardAdmin /></RequireRole>}>
            <Route index element={<DashboardHome />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="solicitudes" element={<AdminSolicitudes />} />
            <Route path="vehiculos" element={<AdminVehiculos />} />
            <Route path="reportes" element={<AdminReportes />} />
            <Route path="estadisticas" element={<AdminEstadisticas />} />
            <Route path="vehiculos/registrar-vehiculo" element={<RegistroVehiculo />} />
            <Route path="vehiculos/listar-vehiculos" element={<ListadoVehiculos />} />
            <Route path="vehiculos/gestionar-tipos" element={<AdminTiposVehiculos />} />
            
            <Route path="finanzas" element={<AdminFinanzasMenu />} />
            <Route path="finanzas/gestion" element={<AdminFinanzas />} />
            <Route path="finanzas/mensualidades" element={<AdminMensualidades />} />
            <Route path="finanzas/estado-cuenta" element={<AdminEstadoCuenta />} />
          </Route>

          <Route path="/recuperar-password" element={<SolicitarRecuperacion />} />
          <Route path="/restablecer-password/:uid/:token" element={<RecuperarPassword />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
