import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaBox,
    FaShoppingCart,
    FaChartBar,
    FaUsers,
    FaCog,
    FaChevronLeft,
    FaChevronRight,
    FaHome
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!collapsed && <span className="brand-name">MarketCali</span>}
                <button className="collapse-btn" onClick={toggleCollapse}>
                    {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end>
                            <FaHome className="nav-icon" />
                            {!collapsed && <span className="nav-text">Inicio</span>}
                        </NavLink>
                    </li>

                    {isAdmin && (
                        <li>
                            <NavLink to="/admin/productos" className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FaBox className="nav-icon" />
                                {!collapsed && <span className="nav-text">Inventario</span>}
                            </NavLink>
                        </li>
                    )}

                    <li>
                        <NavLink to="/sales" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FaShoppingCart className="nav-icon" />
                            {!collapsed && <span className="nav-text">Ventas</span>}
                        </NavLink>
                    </li>

                    {isAdmin && (
                        <>
                            <li>
                                <NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : '')}>
                                    <FaChartBar className="nav-icon" />
                                    {!collapsed && <span className="nav-text">Reportes</span>}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>
                                    <FaUsers className="nav-icon" />
                                    {!collapsed && <span className="nav-text">Usuarios</span>}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/config" className={({ isActive }) => (isActive ? 'active' : '')}>
                                    <FaCog className="nav-icon" />
                                    {!collapsed && <span className="nav-text">Configuración</span>}
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
