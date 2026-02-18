import { useState, useEffect, useRef, useMemo } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBarcode, FaBox, FaArrowLeft, FaTimes } from "react-icons/fa";
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BarcodeScanner from "../../components/BarcodeScanner";

Modal.setAppElement('#root');

const ProductosCRUD = () => {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentProducto, setCurrentProducto] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('barcode');
  const [tempBarcode, setTempBarcode] = useState('');
  const scannerRef = useRef(null);
  const [modalType, setModalType] = useState(null);

  const [formData, setFormData] = useState({
    codigoBarras: "",
    nombre: "",
    marca: "",
    precio: 0,
    cantidad: 0,
    categoria: "",
    descripcion: "",
    imagen: ""
  });

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("http://localhost:8088/api/productos", {
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        });
        if (!response.ok) {
          throw new Error(`Error al cargar productos: ${response.status}`);
        }
        const data = await response.json();
        setProductos(data);
        setFilteredProductos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const filtered = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.marca && producto.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (producto.categoria && producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (producto.codigoBarras && producto.codigoBarras.includes(searchTerm))
    );
    setFilteredProductos(filtered);
  }, [searchTerm, productos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "precio" || name === "cantidad" ? Number(value) : value
    });
  };

  const handleBarcodeSubmit = async () => {
    if (!tempBarcode) {
      toast.error('Por favor ingrese un código de barras');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8088/api/productos/codigo/${tempBarcode}`);

      if (response.ok) {
        const productoExistente = await response.json();
        toast.warn(`El código ${tempBarcode} ya existe para el producto: ${productoExistente.nombre}`);
        mostrarProducto(productoExistente);
        return;
      }
    } catch (error) {
      console.error("Error al verificar código:", error);
    }

    setFormData({
      codigoBarras: tempBarcode,
      nombre: "",
      marca: "",
      precio: 0,
      cantidad: 0,
      categoria: "",
      descripcion: "",
      imagen: ""
    });
    setStep('form');
  };

  const openScannerModal = () => {
    setModalType('scanner');
    setCurrentProducto(null);
    setTempBarcode('');
  };

  const openFormModal = (producto = null) => {
    setModalType('form');
    setCurrentProducto(producto);
    if (producto) {
      setFormData({
        codigoBarras: producto.codigoBarras || "",
        nombre: producto.nombre,
        marca: producto.marca || "",
        precio: producto.precio,
        cantidad: producto.cantidad,
        categoria: producto.categoria || "",
        descripcion: producto.descripcion || "",
        imagen: producto.imagen || ""
      });
    }
  };


  const closeModal = () => {
    setModalType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Solo para debugging - verifica qué estás enviando
    console.log("Enviando datos:", formData);
    console.log("Current producto:", currentProducto);

    try {
      // Determina si es creación o actualización
      const isUpdating = currentProducto && currentProducto.id;

      const url = isUpdating
        ? `http://localhost:8088/api/productos/${currentProducto.id}`
        : "http://localhost:8088/api/productos";

      const method = isUpdating ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('token')
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error en la operación");
      }

      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      // Actualiza el estado según corresponda
      if (isUpdating) {
        setProductos(productos.map(p =>
          p.id === currentProducto.id ? result : p
        ));
      } else {
        setProductos([...productos, result]);
      }

      closeModal();
      toast.success(`Producto ${isUpdating ? "actualizado" : "creado"} correctamente`);
    } catch (err) {
      console.error("Error completo:", err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const response = await fetch(`http://localhost:8088/api/productos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar el producto");

      setProductos(productos.filter(p => p.id !== id));
      toast.success("Producto eliminado correctamente");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBarcodeScanned = async (codigoBarras) => {
    setTempBarcode(codigoBarras);

    try {
      const response = await fetch(`http://localhost:8088/api/productos/codigo/${codigoBarras}`, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });

      if (response.ok) {
        const producto = await response.json();
        setFormData({
          codigoBarras: producto.codigoBarras,
          nombre: producto.nombre,
          marca: producto.marca || "",
          precio: producto.precio,
          cantidad: producto.cantidad,
          categoria: producto.categoria || "",
          descripcion: producto.descripcion || "",
          imagen: producto.imagen || ""
        });
        setModalType('form');
        toast.success(`Producto encontrado: ${producto.nombre}`);
      } else if (response.status === 404) {
        setFormData({
          codigoBarras: codigoBarras,
          nombre: "",
          marca: "",
          precio: 0,
          cantidad: 0,
          categoria: "",
          descripcion: "",
          imagen: ""
        });
        setModalType('form');
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const mostrarProducto = (producto) => {
    setCurrentProducto(producto);
    setFormData({
      codigoBarras: producto.codigoBarras,
      nombre: producto.nombre,
      marca: producto.marca,
      precio: producto.precio,
      cantidad: producto.cantidad,
      categoria: producto.categoria,
      descripcion: producto.descripcion,
      imagen: producto.imagen
    });
    setStep('form');
  };

  const renderModalContent = () => {
    if (step === 'barcode') {
      return (
        <div className="barcode-step">
          {showScanner ? (
            <div className="scanner-wrapper">
              <BarcodeScanner
                onScan={handleBarcodeScanned}
                onClose={() => setShowScanner(false)}
              />
            </div>
          ) : (
            <>
              <h3>Ingresar Código de Barras</h3>
              <div className="form-group">
                <label>Código de Barras *</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    value={tempBarcode}
                    onChange={(e) => setTempBarcode(e.target.value)}
                    required
                    autoFocus
                    placeholder="Escanear o ingresar manualmente"
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="btn-scan-inline"
                  >
                    <FaBarcode /> Escanear
                  </button>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleBarcodeSubmit}
                  className="btn-save"
                  disabled={!tempBarcode}
                >
                  Continuar
                </button>
              </div>
            </>
          )}
        </div>
      );
    }
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Código de Barras *</label>
          <input
            type="text"
            name="codigoBarras"
            value={formData.codigoBarras}
            readOnly
            className="read-only-input"
          />
        </div>

        <div className="form-group">
          <label>Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
            minLength="3"
            maxLength="100"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Marca</label>
            <input
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleInputChange}
              maxLength="50"
            />
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <input
              type="text"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              maxLength="50"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Precio *</label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleInputChange}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Stock *</label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            rows="3"
            maxLength="500"
          />
        </div>

        <div className="form-group">
          <label>URL de Imagen</label>
          <input
            type="text"
            name="imagen"
            value={formData.imagen}
            onChange={handleInputChange}
            placeholder="https://ejemplo.com/imagen.jpg"
            maxLength="255"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => setStep('barcode')}
            className="btn-back"
          >
            <FaArrowLeft /> Volver
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Producto"}
          </button>
        </div>
      </form>
    );
  };

  if (loading && productos.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="productos-crud-container">
      <ToastContainer />
      <div className="crud-header">
        <h1><FaBox /> Administración de Productos</h1>
        <div className="header-actions">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, marca, categoría o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="buttons-container">
            <button onClick={openFormModal} className="btn-add">
              <FaPlus /> Nuevo Producto
            </button>

          </div>
        </div>
      </div>

      <div className="productos-table-container">
        <table className="productos-table">
          <thead>
            <tr>
              <th>Código Barras</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductos.length > 0 ? (
              filteredProductos.map((producto) => (
                <tr key={producto.id}>
                  <td className="text-center">
                    <FaBarcode /> {producto.codigoBarras || "N/A"}
                  </td>
                  <td>{producto.nombre}</td>
                  <td>{producto.marca || "-"}</td>
                  <td className="text-right">${producto.precio.toFixed(2)}</td>
                  <td className={`text-center ${producto.cantidad > 0 ? "in-stock" : "out-of-stock"}`}>
                    {producto.cantidad}
                  </td>
                  <td>{producto.categoria || "-"}</td>
                  <td className="actions">
                    <button
                      onClick={() => openFormModal(producto)}
                      className="btn-edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(producto.id)}
                      className="btn-delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalType !== null}
        onRequestClose={closeModal}
        className="crud-modal"
        overlayClassName="crud-modal-overlay"
      >
        {modalType === 'scanner' ? (
          <div className="scanner-container">
            <button className="scanner-close-btn" onClick={closeModal}>
              <FaTimes />
            </button>
            <BarcodeScanner
              onScan={handleBarcodeScanned}
              onClose={closeModal}
            />
          </div>
        ) : (
          <div className="form-container">
            {renderModalContent()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductosCRUD;