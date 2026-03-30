import { useState, useEffect, useRef } from 'react';
import { FaBarcode, FaTrash, FaPrint, FaSave } from 'react-icons/fa';
import BarcodeScanner from "../../components/BarcodeScanner";

const RegistroProductos = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productoActual, setProductoActual] = useState({
    codigo: '',
    nombre: '',
    precio: 0,
    cantidad: 1
  });
  const [total, setTotal] = useState(0);
  const scannerRef = useRef(null);

  // Buscar producto en la base de datos
  const buscarProducto = async (codigo) => {
    try {
      // Reemplaza con tu endpoint real
      const response = await fetch(`/api/productos/codigo/${codigo}`);
      if (response.ok) {
        const producto = await response.json();
        return producto;
      }
      return null;
    } catch (error) {
      console.error("Error buscando producto:", error);
      return null;
    }
  };

  // Manejar código escaneado
  const handleScan = async (codigo) => {
    setShowScanner(false);

    const productoExistente = productos.find(p => p.codigo === codigo);
    if (productoExistente) {
      // Si ya existe, aumentar cantidad
      setProductos(productos.map(p =>
        p.codigo === codigo ? { ...p, cantidad: p.cantidad + 1 } : p
      ));
      return;
    }

    // Buscar en la base de datos
    const productoDB = await buscarProducto(codigo);
    if (productoDB) {
      setProductos([...productos, {
        codigo: productoDB.codigoBarras,
        nombre: productoDB.nombre,
        precio: productoDB.precio,
        cantidad: 1
      }]);
    } else {
      // Producto no encontrado, permitir registro manual
      setProductoActual({
        codigo,
        nombre: '',
        precio: 0,
        cantidad: 1
      });
    }
  };

  // Actualizar producto manualmente
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductoActual({
      ...productoActual,
      [name]: name === 'precio' || name === 'cantidad' ? Number(value) : value
    });
  };

  // Agregar producto manual
  const agregarProducto = () => {
    if (!productoActual.codigo || !productoActual.nombre) return;

    setProductos([...productos, productoActual]);
    setProductoActual({
      codigo: '',
      nombre: '',
      precio: 0,
      cantidad: 1
    });
  };

  // Eliminar producto
  const eliminarProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  // Calcular total
  useEffect(() => {
    const nuevoTotal = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    setTotal(nuevoTotal);
  }, [productos]);

  // Guardar registro
  const guardarRegistro = async () => {
    try {
      const response = await fetch('/api/registros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productos,
          total,
          fecha: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Registro guardado exitosamente');
        setProductos([]);
      }
    } catch (error) {
      console.error("Error guardando registro:", error);
    }
  };

  return (
    <div className="registro-container">
      <h1><FaBarcode /> Registro de Productos</h1>

      <div className="scanner-section">
        <button
          onClick={() => setShowScanner(true)}
          className="btn-scan"
        >
          <FaBarcode /> Escanear Producto
        </button>

        {showScanner && (
          <div className="scanner-modal" ref={scannerRef}>
            <BarcodeScanner
              onScan={handleScan}
              onClose={() => setShowScanner(false)}
            />
          </div>
        )}
      </div>

      {/* Formulario para producto no encontrado */}
      {productoActual.codigo && !productos.some(p => p.codigo === productoActual.codigo) && (
        <div className="producto-form">
          <h3>Producto no encontrado: {productoActual.codigo}</h3>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={productoActual.nombre}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Precio:</label>
            <input
              type="number"
              name="precio"
              value={productoActual.precio}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Cantidad:</label>
            <input
              type="number"
              name="cantidad"
              value={productoActual.cantidad}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>
          <button onClick={agregarProducto} className="btn-add">
            Agregar Producto
          </button>
        </div>
      )}

      {/* Lista de productos */}
      <div className="productos-list">
        <h2>Productos Registrados</h2>
        {productos.length === 0 ? (
          <p>No hay productos registrados</p>
        ) : (
          <table className="productos-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Precio Unit.</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => (
                <tr key={`${producto.codigo}-${index}`}>
                  <td>{producto.codigo}</td>
                  <td>{producto.nombre}</td>
                  <td>${producto.precio.toFixed(2)}</td>
                  <td>{producto.cantidad}</td>
                  <td>${(producto.precio * producto.cantidad).toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => eliminarProducto(index)}
                      className="btn-delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="total-label">TOTAL:</td>
                <td className="total-amount">${total.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Acciones finales */}
      {productos.length > 0 && (
        <div className="acciones-finales">
          <button onClick={guardarRegistro} className="btn-save">
            <FaSave /> Guardar Registro
          </button>
          <button onClick={() => window.print()} className="btn-print">
            <FaPrint /> Imprimir Ticket
          </button>
        </div>
      )}
    </div>
  );
};

export default RegistroProductos;