import { useEffect, useState } from "react";
import { FaBarcode, FaBox, FaWeight, FaMoneyBillWave, FaInfoCircle, FaStore, FaTag, FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

function ProductoVisualizador() {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await fetch(`/api/productos/${id}`, {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Producto no encontrado (ID: ${id})`);
        }

        const data = await response.json();
        setProducto(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

  if (loading) {
    return (
      <div className="visualizador-loading">
        <div className="spinner"></div>
        <p>Leyendo código de barras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visualizador-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Volver
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
        <h1>Información del Producto</h1>
      </div>

      <div className="producto-card">
        <div className="producto-id">
          <FaBarcode /> Código: {producto.id}
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
              <span>Imagen no disponible</span>
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
              <span className="detalle-valor precio">${producto.precio.toFixed(2)}</span>
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

          <div className="producto-footer">
            <div className="codigo-barras">
              <FaBarcode /> Código: {producto.id}
            </div>
            <div className="fecha-consulta">
              Consultado: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductoVisualizador;