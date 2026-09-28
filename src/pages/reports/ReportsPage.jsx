import { useState, useEffect, useMemo } from 'react';
import {
    FaFilePdf,
    FaSearch,
    FaCalendarAlt,
    FaChartLine,
    FaFileInvoiceDollar,
    FaMoneyBillWave,
    FaReceipt,
    FaTimes,
    FaCreditCard,
    FaMobileAlt
} from 'react-icons/fa';
import api from '../../api/client';
import './ReportsPage.css';

const formatCOP = (value) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
};

const ReportsPage = () => {
    const [sales, setSales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/sales');
            const data = res.data;
            data.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
            setSales(data);
        } catch (error) {
            console.error('Error al cargar ventas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const matchesSearch = !searchTerm ||
                sale.id.toString().includes(searchTerm) ||
                (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (sale.customerDoc && sale.customerDoc.includes(searchTerm));

            const matchesDate = !dateFilter ||
                (sale.saleDate && sale.saleDate.startsWith(dateFilter));

            return matchesSearch && matchesDate;
        });
    }, [sales, searchTerm, dateFilter]);

    // Financial KPI Metrics
    const totalRevenue = useMemo(() => {
        return filteredSales.reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);
    }, [filteredSales]);

    const totalTickets = filteredSales.length;

    const averageTicket = useMemo(() => {
        return totalTickets > 0 ? totalRevenue / totalTickets : 0;
    }, [totalRevenue, totalTickets]);

    const downloadInvoice = async (saleId) => {
        try {
            const response = await api.get(`/api/sales/${saleId}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `factura_marketcali_${saleId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar factura:', error);
            alert('No se pudo descargar la factura');
        }
    };

    const renderPaymentBadge = (method) => {
        switch (method) {
            case 'TARJETA':
                return (
                    <span className="pay-badge card">
                        <FaCreditCard /> Tarjeta
                    </span>
                );
            case 'TRANSFERENCIA':
                return (
                    <span className="pay-badge transfer">
                        <FaMobileAlt /> Transferencia
                    </span>
                );
            default:
                return (
                    <span className="pay-badge cash">
                        <FaMoneyBillWave /> Efectivo
                    </span>
                );
        }
    };

    return (
        <div className="reports-dashboard-container">
            {/* Header */}
            <div className="reports-top-bar">
                <div>
                    <h2><FaChartLine /> Reporte de Ventas y Facturación</h2>
                    <p className="reports-subtitle">Historial de tickets, ingresos y comprobantes emitidos en caja</p>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="reports-kpi-grid">
                <div className="reports-stat-card">
                    <div className="stat-icon-wrapper revenue">
                        <FaMoneyBillWave />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Ingresos Totales</span>
                        <span className="stat-number revenue-value">{formatCOP(totalRevenue)}</span>
                    </div>
                </div>

                <div className="reports-stat-card">
                    <div className="stat-icon-wrapper invoices">
                        <FaFileInvoiceDollar />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Facturas Emitidas</span>
                        <span className="stat-number">{totalTickets}</span>
                    </div>
                </div>

                <div className="reports-stat-card">
                    <div className="stat-icon-wrapper ticket">
                        <FaReceipt />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Ticket Promedio</span>
                        <span className="stat-number">{formatCOP(averageTicket)}</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="reports-filter-bar">
                <div className="reports-search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por No. Factura, nombre de cliente o C.C...."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="reports-date-box">
                    <FaCalendarAlt className="calendar-icon" />
                    <input
                        type="date"
                        className="date-input"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                    {dateFilter && (
                        <button className="clear-date" onClick={() => setDateFilter('')} title="Limpiar fecha">
                            <FaTimes />
                        </button>
                    )}
                </div>
            </div>

            {/* Sales Table Card */}
            <div className="reports-table-card">
                <div className="table-responsive">
                    {loading ? (
                        <div className="reports-loading">
                            <div className="loading-spinner"></div>
                            <p>Cargando transacciones...</p>
                        </div>
                    ) : (
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>No. Factura</th>
                                    <th>Fecha y Hora</th>
                                    <th>Cliente</th>
                                    <th>Documento</th>
                                    <th>Medio de Pago</th>
                                    <th className="text-right">Total Facturado</th>
                                    <th className="text-center">Comprobante</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map(sale => (
                                    <tr key={sale.id}>
                                        <td className="sale-id-cell">
                                            <strong>#{sale.id}</strong>
                                        </td>
                                        <td className="date-cell">
                                            {new Date(sale.saleDate).toLocaleString('es-CO', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="customer-name-cell">
                                            {sale.customerName || `Cliente #${sale.customerId || '1'}`}
                                        </td>
                                        <td className="customer-doc-cell">
                                            {sale.customerDoc || '222222222222'}
                                        </td>
                                        <td>
                                            {renderPaymentBadge(sale.paymentMethod)}
                                        </td>
                                        <td className="text-right amount-cell">
                                            {formatCOP(sale.totalAmount)}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn-download-invoice"
                                                onClick={() => downloadInvoice(sale.id)}
                                                title="Descargar Factura Oficial PDF"
                                            >
                                                <FaFilePdf /> Factura
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSales.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="7" className="empty-reports-cell">
                                            <FaReceipt size={36} />
                                            <p>No se encontraron registros de ventas con los filtros especificados.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
