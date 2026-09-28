import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { FaPrint, FaTimes, FaTag, FaBarcode, FaStore } from 'react-icons/fa';
import './BarcodeLabelModal.css';

const formatCOP = (value) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
};

const BarcodeLabelModal = ({ product, isOpen, onClose }) => {
    const svgRef = useRef(null);
    const [labelType, setLabelType] = useState('shelf'); // 'shelf' (góndola) or 'compact' (sticker)
    const [copies, setCopies] = useState(1);

    useEffect(() => {
        if (isOpen && product && svgRef.current) {
            try {
                const code = product.codigoBarras || product.id?.toString() || '00000000';
                JsBarcode(svgRef.current, code, {
                    format: "CODE128",
                    lineColor: "#000000",
                    width: labelType === 'shelf' ? 2 : 1.6,
                    height: labelType === 'shelf' ? 50 : 36,
                    displayValue: true,
                    fontSize: 13,
                    fontOptions: "bold",
                    margin: 4,
                    background: "#ffffff"
                });
            } catch (err) {
                console.error("Error al renderizar código de barras con JsBarcode:", err);
            }
        }
    }, [isOpen, product, labelType]);

    if (!isOpen || !product) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="label-modal-overlay">
            <div className="label-modal-container">
                {/* Header (No imprimible) */}
                <div className="label-modal-header no-print">
                    <div className="modal-title-wrap">
                        <FaTag className="modal-title-icon" />
                        <div>
                            <h3>Generador de Etiquetas de Precio y Código</h3>
                            <p>Vista previa e impresión para estantería y productos</p>
                        </div>
                    </div>
                    <button className="btn-close-label-modal" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Controles de Configuración (No imprimibles) */}
                <div className="label-controls-bar no-print">
                    <div className="control-group">
                        <label>Tipo de Etiqueta:</label>
                        <div className="toggle-label-type">
                            <button
                                className={`btn-type-pill ${labelType === 'shelf' ? 'active' : ''}`}
                                onClick={() => setLabelType('shelf')}
                            >
                                Cenefa de Góndola (Estante)
                            </button>
                            <button
                                className={`btn-type-pill ${labelType === 'compact' ? 'active' : ''}`}
                                onClick={() => setLabelType('compact')}
                            >
                                Sticker Adhesivo (Empaque)
                            </button>
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Copias a Imprimir:</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={copies}
                            onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                            className="copies-input"
                        />
                    </div>
                </div>

                {/* Área de Visualización e Impresión */}
                <div className="label-preview-wrapper">
                    <div className="printable-labels-area">
                        {Array.from({ length: copies }).map((_, index) => (
                            <div
                                key={index}
                                className={`market-label ${labelType === 'shelf' ? 'shelf-tag' : 'compact-sticker'}`}
                            >
                                {labelType === 'shelf' ? (
                                    /* Etiqueta de Góndola (Estantería) */
                                    <div className="shelf-label-layout">
                                        <div className="label-top-brand">
                                            <span className="store-tag"><FaStore /> MarketCali</span>
                                            <span className="product-category-tag">{product.categoria || 'General'}</span>
                                        </div>

                                        <div className="shelf-main-content">
                                            <div className="product-text-details">
                                                <h4 className="shelf-product-name">{product.nombre}</h4>
                                                <span className="shelf-product-brand">Marca: {product.marca || 'Genérico'}</span>
                                            </div>
                                            <div className="shelf-price-badge">
                                                <span className="price-currency-sign">$</span>
                                                <span className="price-big-number">
                                                    {Number(product.precio).toLocaleString('es-CO')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="shelf-barcode-container">
                                            <svg ref={index === 0 ? svgRef : null} className="barcode-svg-element"></svg>
                                        </div>

                                        <div className="shelf-footer-meta">
                                            <span>COD: {product.codigoBarras || product.id}</span>
                                            <span>STOCK: {product.cantidad} UND</span>
                                            <span>{new Date().toLocaleDateString('es-CO')}</span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Sticker Adhesivo Compacto */
                                    <div className="compact-label-layout">
                                        <div className="compact-header">
                                            <span className="compact-store">MarketCali</span>
                                            <strong className="compact-price">{formatCOP(product.precio)}</strong>
                                        </div>
                                        <div className="compact-title">{product.nombre}</div>
                                        <div className="compact-barcode">
                                            <svg ref={index === 0 ? svgRef : null} className="barcode-svg-element"></svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Acciones del Modal (No imprimibles) */}
                <div className="label-modal-footer no-print">
                    <button className="btn-cancel-label" onClick={onClose}>
                        Cerrar
                    </button>
                    <button className="btn-print-action" onClick={handlePrint}>
                        <FaPrint /> Imprimir {copies} {copies === 1 ? 'Etiqueta' : 'Etiquetas'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BarcodeLabelModal;
