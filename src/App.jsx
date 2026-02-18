import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import About from "./pages/others/About";
import Producto from "./pages/productos/Producto";
import ProductoVisualizador from "./pages/productos/ProductoVisualizador";
import ProductoCRUD from "./pages/productos/ProductoCRUD"
import RegistroProducto from "./pages/registros/RegistroProducto";
import SalesPage from "./pages/sales/SalesPage";
import ReportsPage from "./pages/reports/ReportsPage";
import UsersPage from "./pages/users/UsersPage";
import Login from "./pages/auth/Login";

function App() {
  return (
    <div className="app-container">
      <Layout>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/sobrenosotros" element={<About />} />
          <Route path="/productos" element={<Producto />} />
          <Route path="/producto/:id" element={<ProductoVisualizador />} />
          <Route path="/admin/productos" element={<ProductoCRUD />} />
          <Route path="/registro/productos" element={<RegistroProducto />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
