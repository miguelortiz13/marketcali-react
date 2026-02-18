import { useState, useEffect } from 'react';
import { FaFilePdf, FaSearch, FaCalendarAlt, FaDownload } from 'react-icons/fa';
import './ReportsPage.css';

const ReportsPage = () => {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await fetch('http://localhost:8088/api/sales');
            if (res.ok) {
                const data = await res.json();
                // Sort by date desc
                data.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
                setSales(data);
                setFilteredSales(data);
            }
        } catch (error) {
            console.error('Error fetching sales:', error);
        }
    };

    useEffect(() => {
        let result = sales;

        if (searchTerm) {
            result = result.filter(sale =>
                sale.id.toString().includes(searchTerm) ||
                sale.customerId.toString().includes(searchTerm)
            );
        }

        if (dateFilter) {
            result = result.filter(sale =>
                sale.saleDate.startsWith(dateFilter)
            );
        }

        setFilteredSales(result);
    }, [searchTerm, dateFilter, sales]);

    const downloadInvoice = (saleId) => {
        window.open(`http://localhost:8088/api/sales/${saleId}/invoice`, '_blank');
    };

    return (
        <div className="reports-container">
            <div className="reports-header">
                <h2><FaCalendarAlt /> Reporte de Ventas</h2>
                <div className="filters">
                    <div className="search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Buscar por ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <input
                        type="date"
                        className="date-filter"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="sales-table-container">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>ID Venta</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map(sale => (
                            <tr key={sale.id}>
                                <td>#{sale.id}</td>
                                <td>{new Date(sale.saleDate).toLocaleString()}</td>
                                <td>Cliente #{sale.customerId}</td>
                                <td className="amount">${sale.totalAmount.toFixed(2)}</td>
                                <td>
                                    <button
                                        className="download-btn"
                                        onClick={() => downloadInvoice(sale.id)}
                                        title="Descargar Factura PDF"
                                    >
                                        <FaFilePdf /> Descargar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredSales.length === 0 && (
                            <tr>
                                <td colSpan="5" className="no-data">No se encontraron ventas</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsPage;
