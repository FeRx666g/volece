import React from 'react';
import AccesoDenegado from './AccesoDenegado';

const RequireAuth = ({ children }) => {
    const token = localStorage.getItem('access');

    if (!token) {
        return <AccesoDenegado />;
    }

    return children;
};

export default RequireAuth;
