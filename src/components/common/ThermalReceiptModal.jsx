import { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import {
    FaPrint,
    FaTimes,
    FaCog,
    FaCashRegister
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { playBarcodeBeep } from '../../utils/audio';
import './ThermalReceiptModal.css';

const DEFAULT_CONFIG = {
    businessName: 'NexPOS - Retail & Punto de Venta',
    nit: 'NIT: 900.785.412-8 • Régimen Común',
    address: 'Av. Roosevelt # 34-50, Cali - Colombia',
    phone: 'Tel: (602) 889-1234 • WhatsApp: 315 000 0000',
    footerMessage: '¡Gracias por su compra!\nConserve este tiquete para garantías y cambios.\nSoftware POS: NexPOS Cloud v2.0',
    autoDrawer: true
};

const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(Number(val) || 0);
};

const formatDateTime = (dtStr) => {
    if (!dtStr) return new Date().toLocaleString('es-CO');
    const d = new Date(dtStr);
    return d.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const ThermalReceiptModal = ({ sale, isOpen, onClose, autoPrint = false }) => {
    const barcodeRef = useRef(null);

    // Configuración guardada en localStorage
    const [paperWidth, setPaperWidth] = useState(() => localStorage.getItem('nexpos_paper_width') || '80mm');
    const [showConfig, setShowConfig] = useState(false);
    const [config, setConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('nexpos_thermal_config');
            return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
        } catch (e) {
            return DEFAULT_CONFIG;
        }
    });

    const [drawerKicked, setDrawerKicked] = useState(false);

    // Guardar cambios de ancho de papel
    const handleSetPaperWidth = (width) => {
        setPaperWidth(width);
        localStorage.setItem('nexpos_paper_width', width);
    };

    // Guardar configuración del comercio
    const handleUpdateConfigField = (field, value) => {
        const updated = { ...config, [field]: value };
        setConfig(updated);
        localStorage.setItem('nexpos_thermal_config', JSON.stringify(updated));
    };

    // Renderizar código de barras del ticket con JsBarcode
    useEffect(() => {
        if (isOpen && sale && barcodeRef.current) {
            try {
                const code = sale.invoiceNumber || `FAC-${String(sale.id).padStart(6, '0')}`;
                JsBarcode(barcodeRef.current, code, {
                    format: "CODE128",
                    lineColor: "#000000",
                    width: paperWidth === '80mm' ? 1.7 : 1.3,
                    height: paperWidth === '80mm' ? 40 : 30,
                    displayValue: true,
                    fontSize: 10,
                    margin: 4,
                    background: "#ffffff"
                });
            } catch (err) {
                console.error("Error al renderizar código de barras en ticket:", err);
            }
        }
    }, [isOpen, sale, paperWidth]);

    // Auto-impresión si viene habilitada
    useEffect(() => {
        if (isOpen && autoPrint && sale) {
            const timer = setTimeout(() => {
                handlePrint();
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoPrint, sale]);

    if (!isOpen || !sale) return null;

    // Disparador de apertura de gaveta monedero
    const handleKickDrawer = () => {
        setDrawerKicked(true);
        try {
            playBarcodeBeep('success');
        } catch (e) {}
        toast.info('⚡ Señal enviada a la gaveta monedero (RJ11/RJ12)');
        setTimeout(() => setDrawerKicked(false), 2000);
    };

    // Impresión térmica directa
    const handlePrint = () => {
        if (config.autoDrawer && sale.paymentMethod === 'EFECTIVO') {
            handleKickDrawer();
        }
        window.print();
    };

    // Datos calculados del tiquete
    const items = sale.items || [];
    const invoiceNum = sale.invoiceNumber || `FAC-${String(sale.id).padStart(6, '0')}`;
    const totalAmount = Number(sale.totalAmount) || 0;
    const paidAmount = Number(sale.amountPaid) || totalAmount;
    const changeAmount = Number(sale.changeAmount) || 0;

    return (
        <div className="thermal-modal-overlay" onClick={onClose}>
            <div className="thermal-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="thermal-modal-header">
                    <h3>
                        <FaPrint className="thermal-header-icon" /> Tiquete de Venta Térmico POS
                    </h3>
                    <button className="btn-close-thermal" onClick={onClose} title="Cerrar ventana">
                        <FaTimes />
                    </button>
                </div>

                {/* Toolbar de Controles */}
                <div className="thermal-controls-toolbar">
                    <div className="paper-width-selector">
                        <button
                            className={`btn-width-toggle ${paperWidth === '80mm' ? 'active' : ''}`}
                            onClick={() => handleSetPaperWidth('80mm')}
                        >
                            80mm (Estándar)
                        </button>
                        <button
                            className={`btn-width-toggle ${paperWidth === '58mm' ? 'active' : ''}`}
                            onClick={() => handleSetPaperWidth('58mm')}
                        >
                            58mm (Compacto)
                        </button>
                    </div>

                    <button
                        className="btn-config-toggle"
                        onClick={() => setShowConfig(!showConfig)}
                    >
                        <FaCog /> {showConfig ? 'Ocultar Datos' : 'Personalizar Comercio'}
                    </button>
                </div>

                {/* Body / Preview */}
                <div className="thermal-modal-body">
                    {/* Panel de Configuración de Datos del Negocio */}
                    {showConfig && (
                        <div className="thermal-settings-panel">
                            <div className="settings-grid">
                                <div className="settings-field">
                                    <label>Nombre del Comercio</label>
                                    <input
                                        type="text"
                                        value={config.businessName}
                                        onChange={(e) => handleUpdateConfigField('businessName', e.target.value)}
                                    />
                                </div>
                                <div className="settings-field">
                                    <label>NIT / Régimen</label>
                                    <input
                                        type="text"
                                        value={config.nit}
                                        onChange={(e) => handleUpdateConfigField('nit', e.target.value)}
                                    />
                                </div>
                                <div className="settings-field">
                                    <label>Dirección</label>
                                    <input
                                        type="text"
                                        value={config.address}
                                        onChange={(e) => handleUpdateConfigField('address', e.target.value)}
                                    />
                                </div>
                                <div className="settings-field">
                                    <label>Teléfono / Contacto</label>
                                    <input
                                        type="text"
                                        value={config.phone}
                                        onChange={(e) => handleUpdateConfigField('phone', e.target.value)}
                                    />
                                </div>
                                <div className="settings-field" style={{ gridColumn: 'span 2' }}>
                                    <label>Mensaje de Pie de Tiquete</label>
                                    <textarea
                                        rows="2"
                                        value={config.footerMessage}
                                        onChange={(e) => handleUpdateConfigField('footerMessage', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HOJA DEL TIQUETE TÉRMICO (Elemento Imprimible) */}
                    <div
                        id="thermal-receipt-printable"
                        className={`thermal-paper-sheet width-${paperWidth}`}
                    >
                        {/* Encabezado */}
                        <div className="ticket-brand-header">
                            <span className="ticket-store-name">{config.businessName}</span>
                            <div className="ticket-meta-info">
                                <div>{config.nit}</div>
                                <div>{config.address}</div>
                                <div>{config.phone}</div>
                            </div>
                        </div>

                        <div className="ticket-divider-line"></div>

                        {/* Metadatos de la Venta */}
                        <div className="ticket-meta-info">
                            <div className="t-row bold">
                                <span>TIQUETE POS:</span>
                                <span>{invoiceNum}</span>
                            </div>
                            <div className="t-row">
                                <span>Fecha:</span>
                                <span>{formatDateTime(sale.saleDate)}</span>
                            </div>
                            <div className="t-row">
                                <span>Cajero:</span>
                                <span>{sale.cashierUsername || 'Cajero 1'}</span>
                            </div>
                            <div className="t-row">
                                <span>Cliente:</span>
                                <span>{sale.customerName || 'Consumidor Final'}</span>
                            </div>
                            <div className="t-row">
                                <span>Doc / NIT:</span>
                                <span>{sale.customerDoc || '222222222222'}</span>
                            </div>
                        </div>

                        <div className="ticket-double-line"></div>

                        {/* Tabla de Artículos */}
                        <div className="ticket-items-table">
                            <div className="t-row bold" style={{ fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                <span>Cant • Descripción</span>
                                <span>Total</span>
                            </div>

                            {items.length === 0 ? (
                                <div className="t-row">
                                    <span>Venta General</span>
                                    <span>{formatCOP(totalAmount)}</span>
                                </div>
                            ) : (
                                items.map((it, idx) => (
                                    <div key={idx} className="ticket-item-row">
                                        <div className="item-name-line">{it.productName}</div>
                                        <div className="item-calc-line">
                                            <span>{it.quantity} x {formatCOP(it.unitPrice)}</span>
                                            <strong>{formatCOP(it.subTotal || (it.quantity * it.unitPrice))}</strong>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="ticket-divider-line"></div>

                        {/* Totales y Medio de Pago */}
                        <div className="ticket-totals-box">
                            <div className="t-row">
                                <span>Subtotal:</span>
                                <span>{formatCOP(totalAmount)}</span>
                            </div>
                            <div className="t-row">
                                <span>IVA / Impuestos:</span>
                                <span>$0 (Incluido)</span>
                            </div>
                            <div className="t-row total-hero">
                                <span>TOTAL A PAGAR:</span>
                                <span>{formatCOP(totalAmount)}</span>
                            </div>
                            <div className="t-row">
                                <span>Medio de Pago:</span>
                                <strong>{sale.paymentMethod || 'EFECTIVO'}</strong>
                            </div>
                            {sale.paymentMethod === 'EFECTIVO' && (
                                <>
                                    <div className="t-row">
                                        <span>Recibido:</span>
                                        <span>{formatCOP(paidAmount)}</span>
                                    </div>
                                    <div className="t-row bold">
                                        <span>CAMBIO / VUELTO:</span>
                                        <span>{formatCOP(changeAmount)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Código de Barras del Tiquete */}
                        <div className="ticket-barcode-box">
                            <svg ref={barcodeRef} className="ticket-barcode-svg"></svg>
                        </div>

                        {/* Pie de Tiquete */}
                        <div className="ticket-footer-text">
                            {config.footerMessage}
                        </div>
                    </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="thermal-modal-footer">
                    <div className="drawer-status-pill">
                        <span>Formato: <strong>{paperWidth}</strong></span>
                    </div>

                    <div className="footer-action-buttons">
                        <button
                            type="button"
                            className="btn-open-drawer"
                            onClick={handleKickDrawer}
                            title="Enviar pulso de apertura al cajón monedero RJ11"
                        >
                            <FaCashRegister /> {drawerKicked ? '¡Gaveta Abierta!' : 'Abrir Gaveta'}
                        </button>

                        <button
                            type="button"
                            className="btn-print-thermal-direct"
                            onClick={handlePrint}
                        >
                            <FaPrint /> Imprimir Tiquete ({paperWidth})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThermalReceiptModal;
