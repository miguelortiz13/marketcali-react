import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo3.png";
import { useEffect, useState } from "react";
import { FaChevronDown, FaUser, FaShoppingCart } from "react-icons/fa";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: "/", text: "Inicio" },
    {
      path: "/productos",
      text: "Productos",
      submenu: [
        { path: "/productos/tecnologia", text: "Tecnología" },
        { path: "/productos/hogar", text: "Hogar" },
        { path: "/productos/ropa", text: "Ropa" },
      ],
    },
    { path: "/sobrenosotros", text: "¿Quiénes Somos?" },
    { path: "/contacto", text: "Contacto" },
  ];

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <nav className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <img
              src={logo}
              alt="MarketCali Logo"
              className="navbar-logo"
              width="40"
              height="40"
              loading="lazy"
            />
            <span className="brand-text">
              <span className="brand-name">MarketCali</span>
              <span className="brand-slogan">Soluciones para tu negocio</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="desktop-menu">
            {navLinks.map((link) => (
              <div key={link.path} className="nav-item">
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? "active" : ""
                    }`}
                >
                  {link.text}
                  {link.submenu && <FaChevronDown className="dropdown-icon" />}
                  <span className="nav-link-underline"></span>
                </Link>

                {link.submenu && (
                  <div className="submenu">
                    {link.submenu.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className="submenu-link"
                      >
                        {sub.text}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Actions */}
          <div className="user-actions">
            <Link to="/login" className="action-link">
              <FaUser className="action-icon" />
              <span>Mi cuenta</span>
            </Link>
            <Link to="/cart" className="action-link cart">
              <FaShoppingCart className="action-icon" />
              <span className="cart-count">0</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className="hamburger-icon">
              <span className={`bar ${mobileMenuOpen ? "open" : ""}`}></span>
              <span className={`bar ${mobileMenuOpen ? "open" : ""}`}></span>
              <span className={`bar ${mobileMenuOpen ? "open" : ""}`}></span>
            </div>
          </button>
        </nav>

        {/* Mobile Menu */}
        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-menu-content">
            {navLinks.map((link) => (
              <div key={link.path} className="mobile-nav-item">
                <Link
                  to={link.path}
                  className={`mobile-nav-link ${location.pathname === link.path ? "active" : ""
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.text}
                </Link>

                {link.submenu && (
                  <div className="mobile-submenu">
                    {link.submenu.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className="mobile-submenu-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {sub.text}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
