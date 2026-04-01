import React from 'react';

const ServiceHistory = () => {
  const historial = [
    { id: 1, origen: 'Riobamba', destino: 'Ambato', estado: 'Completado' },
    { id: 2, origen: 'Guaranda', destino: 'Quito', estado: 'Cancelado' },
  ];

  return (
    <table>
      <thead>
        <tr>
          <th>Origen</th>
          <th>Destino</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {historial.map((s) => (
          <tr key={s.id}>
            <td>{s.origen}</td>
            <td>{s.destino}</td>
            <td>{s.estado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ServiceHistory;
