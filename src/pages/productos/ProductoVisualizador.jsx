import { useEffect, useState, useRef } from "react";
import {
  FaBarcode,
  FaBox,
  FaWeight,
  FaMoneyBillWave,
  FaInfoCircle,
  FaStore,
  FaTag,
  FaArrowLeft,
  FaPrint
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import JsBarcode from "jsbarcode";
import BarcodeLabelModal from "../../components/common/BarcodeLabelModal";
import api from "../../api/client";
import "./ProductoVisualizador.css";

const formatCOP = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
};

function ProductoVisualizador() {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const barcodeRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await api.get(`/api/productos/${id}`);
        setProducto(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || `Producto no encontrado (ID: ${id})`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

  useEffect(() => {
    if (producto && barcodeRef.current) {
      try {
        const code = producto.codigoBarras || producto.id?.toString() || "00000000";
        JsBarcode(barcodeRef.current, code, {
          format: "CODE128",
          lineColor: "#000000",
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          fontOptions: "bold",
          margin: 6,
          background: "#ffffff"
        });
      } catch (e) {
        console.error("Error al renderizar código en visualizador:", e);
      }
    }
  }, [producto]);

  if (loading) {
    return (
      <div className="visualizador-loading">
        <div className="spinner"></div>
        <p>Cargando información del producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visualizador-error">
        <h2>Error al consultar producto</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="producto-visualizador">
      <div className="visualizador-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Volver
        </button>
        <h1>Ficha de Producto</h1>
        <button onClick={() => setShowLabelModal(true)} className="btn-print-tag-top">
          <FaPrint /> Imprimir Etiqueta
        </button>
      </div>

      <div className="producto-card">
        <div className="producto-id">
          <FaBarcode /> Código de Barras Oficial: {producto.codigoBarras || producto.id}
        </div>

        <div className="producto-imagen-container">
          {producto.imagen ? (
            <img 
              src={producto.imagen} 
              alt={producto.nombre} 
              className="producto-imagen"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300?text=Imagen+no+disponible';
              }}
            />
          ) : (
            <div className="producto-imagen-placeholder">
              <FaBox />
              <span>Sin fotografía cargada</span>
            </div>
          )}
        </div>

        <div className="producto-info">
          <h2 className="producto-nombre">{producto.nombre}</h2>

          <div className="producto-detalle">
            <div className="detalle-item">
              <FaTag className="detalle-icon" />
              <span className="detalle-label">Marca:</span>
              <span className="detalle-valor">{producto.marca || "No especificada"}</span>
            </div>

            <div className="detalle-item">
              <FaStore className="detalle-icon" />
              <span className="detalle-label">Categoría:</span>
              <span className="detalle-valor">{producto.categoria || "No especificada"}</span>
            </div>

            <div className="detalle-item">
              <FaMoneyBillWave className="detalle-icon" />
              <span className="detalle-label">Precio:</span>
              <span className="detalle-valor precio">{formatCOP(producto.precio)}</span>
            </div>

            <div className="detalle-item">
              <FaWeight className="detalle-icon" />
              <span className="detalle-label">Stock:</span>
              <span className={`detalle-valor stock ${producto.cantidad > 0 ? "disponible" : "agotado"}`}>
                {producto.cantidad > 0 ? `${producto.cantidad} unidades` : "AGOTADO"}
              </span>
            </div>
          </div>

          {producto.descripcion && (
            <div className="producto-descripcion">
              <FaInfoCircle className="descripcion-icon" />
              <p>{producto.descripcion}</p>
            </div>
          )}

          {/* Renderizado real de código de barras */}
          <div className="rendered-barcode-box">
            <span className="rendered-barcode-label">Código de Barras Escaneable (CODE-128):</span>
            <div className="svg-barcode-center">
              <svg ref={barcodeRef}></svg>
            </div>
          </div>

          <div className="producto-footer">
            <div className="codigo-barras">
              <FaBarcode /> Código: {producto.codigoBarras || producto.id}
            </div>
            <div className="fecha-consulta">
              Consultado: {new Date().toLocaleString('es-CO')}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para imprimir etiquetas */}
      <BarcodeLabelModal
        product={producto}
        isOpen={showLabelModal}
        onClose={() => setShowLabelModal(false)}
      />
    </div>
  );
}

export default ProductoVisualizador;