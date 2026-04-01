import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartBar, FaSearch, FaCalendarAlt, FaDownload } from 'react-icons/fa';
import './estilos/AdminEstadisticas.css';

const AdminEstadisticas = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({
        fechaInicio: '',
        fechaFin: ''
    });

    const [pagina, setPagina] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const token = localStorage.getItem('access');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filtros.fechaInicio) params.fecha_inicio = filtros.fechaInicio;
            if (filtros.fechaFin) params.fecha_fin = filtros.fechaFin;

            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/reportes/viajes-transportista/`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data.data);
            setPagina(1); // Reset to page 1 on new data
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros]);

    const handleChange = (e) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    };

    // Calculate pagination
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const paginatedData = data.slice(
        (pagina - 1) * ITEMS_PER_PAGE,
        pagina * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPagina(newPage);
        }
    };

    // Helper to render page numbers with ellipsis
    const renderPageNumbers = () => {
        const pages = [];
        const MAX_VISIBLE = 10;

        if (totalPages <= MAX_VISIBLE) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            let start = Math.max(2, pagina - 2);
            let end = Math.min(totalPages - 1, pagina + 2);

            if (pagina <= 4) end = 7;
            if (pagina >= totalPages - 3) start = totalPages - 6;

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages.map((p, index) => (
            <button
                key={index}
                onClick={() => typeof p === 'number' ? handlePageChange(p) : null}
                disabled={p === '...'}
                className={p === pagina ? 'active' : ''}
                style={p === '...' ? { border: 'none', background: 'transparent', cursor: 'default' } : {}}
            >
                {p}
            </button>
        ));
    };

    const maxViajes = data.length > 0 ? Math.max(...data.map(d => d.total_viajes)) : 0;

    return (
        <div className="stats-dashboard">
            <header className="stats-header">
                <h1>Estadísticas de Transportistas</h1>
                <p>Visualización de rendimiento y asignación de viajes.</p>
            </header>

            <div className="stats-filters">
                <div className="filter-group">
                    <label>Desde:</label>
                    <div className="input-wrapper">
                        <FaCalendarAlt />
                        <input
                            type="date"
                            name="fechaInicio"
                            value={filtros.fechaInicio}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="filter-group">
                    <label>Hasta:</label>
                    <div className="input-wrapper">
                        <FaCalendarAlt />
                        <input
                            type="date"
                            name="fechaFin"
                            value={filtros.fechaFin}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Cargando datos...</div>
                ) : data.length === 0 ? (
                    <div className="empty-state">No hay transportistas registrados.</div>
                ) : (
                    <>
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Transportista</th>
                                    <th>Total Viajes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{(pagina - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                        <td>{item.transportista}</td>
                                        <td><strong>{item.total_viajes}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {data.length > ITEMS_PER_PAGE && (
                            <div className="stats-pagination">
                                <button
                                    onClick={() => handlePageChange(Math.max(pagina - 1, 1))}
                                    disabled={pagina === 1}
                                >
                                    Anterior
                                </button>
                                {renderPageNumbers()}
                                <button
                                    onClick={() => handlePageChange(Math.min(pagina + 1, totalPages))}
                                    disabled={pagina === totalPages}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="stats-summary">
                <div className="summary-card">
                    <h3>Total Viajes</h3>
                    <p>{data.reduce((acc, curr) => acc + curr.total_viajes, 0)}</p>
                </div>
                <div className="summary-card">
                    <h3>Transportistas Activos</h3>
                    <p>{data.length}</p>
                </div>
                <div className="summary-card">
                    <h3>Transportista con más viajes</h3>
                    <p>{data.length > 0 ? data[0].transportista : '-'}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminEstadisticas;
