import { useState, useEffect } from 'react';
import { FaSearch, FaShoppingCart, FaTrash, FaPlus, FaMinus, FaMoneyBillWave, FaBarcode } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import BarcodeScanner from '../../components/BarcodeScanner';
import 'react-toastify/dist/ReactToastify.css';
import './SalesPage.css';

const SalesPage = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [qty, setQty] = useState(1);

    const handleScan = (code) => {
        const product = products.find(p => p.codigoBarras === code);
        if (product) {
            // Open modal instead of adding directly
            setSelectedProduct(product);
            setQty(1);
            setSearchTerm('');
        } else {
            toast.warn(`Producto no encontrado: ${code}`);
            setSearchTerm(code);
        }
    };

    const addToCart = (product, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity: quantity }];
        });
    };

    // ... imports and previous code ...


    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/productos');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.codigoBarras && p.codigoBarras.includes(searchTerm))
    );



    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);

        const saleRequest = {
            customerId: 1, // Mocked customer
            items: cart.map(item => ({
                productId: item.id,
                productName: item.nombre,
                quantity: item.quantity,
                price: item.precio
            }))
        };

        try {
            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleRequest)
            });

            if (res.ok) {
                toast.success('¡Venta realizada con éxito!');
                setCart([]);
            } else {
                toast.error('Error al procesar la venta');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sales-container">
            <ToastContainer />
            <div className="products-section">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button className="scan-btn" onClick={() => setShowScanner(true)}>
                        <FaBarcode />
                    </button>
                </div>

                {showScanner && (
                    <div className="scanner-modal">
                        <div className="scanner-content">
                            <h3>Escaneando...</h3>
                            <BarcodeScanner
                                onScan={handleScan}
                                onClose={() => setShowScanner(false)}
                            />
                            <button className="close-scan-btn" onClick={() => setShowScanner(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                <div className="products-grid">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="product-card" onClick={() => setSelectedProduct(product)}>
                            <div className="product-info">
                                <h4>{product.nombre}</h4>
                                <p className="price">${product.precio.toFixed(2)}</p>
                                <span className="stock">Stock: {product.cantidad}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cart-section">
                <h3><FaShoppingCart /> Carrito de Compras</h3>

                <div className="cart-items">
                    {cart.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="item-details">
                                <h4>{item.nombre}</h4>
                                <p>${item.precio.toFixed(2)} x {item.quantity}</p>
                            </div>
                            <div className="item-actions">
                                <button onClick={() => updateQuantity(item.id, -1)}><FaMinus /></button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)}><FaPlus /></button>
                                <button className="delete-btn" onClick={() => removeFromCart(item.id)}><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <div className="total">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <button
                        className="checkout-btn"
                        disabled={cart.length === 0 || loading}
                        onClick={handleCheckout}
                    >
                        <FaMoneyBillWave /> {loading ? 'Procesando...' : 'Cobrar'}
                    </button>
                </div>
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="product-detail-modal">
                    <div className="detail-content">
                        <button className="close-detail-btn" onClick={() => setSelectedProduct(null)}>×</button>

                        <div className="detail-grid">
                            <div className="detail-image">
                                {selectedProduct.imagen ? (
                                    <img src={selectedProduct.imagen} alt={selectedProduct.nombre} />
                                ) : (
                                    <div className="no-image-placeholder">
                                        <FaBox size={50} />
                                    </div>
                                )}
                            </div>
                            <div className="detail-info">
                                <h2>{selectedProduct.nombre}</h2>
                                <p className="detail-brand">{selectedProduct.marca}</p>
                                <p className="detail-price">${selectedProduct.precio?.toFixed(2)}</p>
                                <p className="detail-desc">{selectedProduct.descripcion || 'Sin descripción disponible.'}</p>
                                <p className="detail-stock">Stock disponible: {selectedProduct.cantidad}</p>

                                <div className="detail-actions">
                                    <div className="qty-selector">
                                        <button onClick={() => setQty(Math.max(1, qty - 1))}><FaMinus /></button>
                                        <span>{qty}</span>
                                        <button onClick={() => setQty(qty + 1)}><FaPlus /></button>
                                    </div>
                                    <button
                                        className="add-to-cart-btn"
                                        onClick={() => {
                                            addToCart(selectedProduct, qty);
                                            setSelectedProduct(null);
                                            setQty(1);
                                            toast.success('Producto agregado');
                                        }}
                                    >
                                        <FaShoppingCart /> Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesPage;
