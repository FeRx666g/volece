import React from 'react';
import AccesoDenegado from './AccesoDenegado';
import AccesoNoAutorizado from './AccesoNoAutorizado';

const RequireRole = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('access');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <AccesoDenegado />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <AccesoNoAutorizado />;
    }

    return children;
};

export default RequireRole;
