import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import About from "./pages/others/About";
import Producto from "./pages/productos/Producto";
import ProductoVisualizador from "./pages/productos/ProductoVisualizador";
import ProductoCRUD from "./pages/productos/ProductoCRUD"
import RegistroProducto from "./pages/registros/RegistroProducto";
import Login from "./pages/auth/Login";

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/sobrenosotros" element={<About />} />
          <Route path="/productos" element={<Producto />} />
          <Route path="/producto/:id" element={<ProductoVisualizador />} />
          <Route path="/admin/productos" element={<ProductoCRUD />} />
          <Route path="/registro/productos" element={<RegistroProducto />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
