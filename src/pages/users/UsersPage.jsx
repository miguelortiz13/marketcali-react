import { useState, useEffect } from 'react';
import { FaUserPlus, FaTrash, FaUserShield, FaUserCheck, FaTimes, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import api from '../../api/client';
import './UsersPage.css';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'USER' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            const msg = error.response?.data?.message || 'Error al cargar usuarios';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`¿Estás seguro de eliminar el usuario "${username}"?`)) return;

        try {
            await api.delete(`/api/users/${id}`);
            toast.success(`Usuario ${username} eliminado`);
            fetchUsers();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            const msg = error.response?.data?.message || 'Error al eliminar usuario';
            toast.error(msg);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/users', newUser);
            toast.success('Usuario registrado exitosamente');
            setShowModal(false);
            setNewUser({ username: '', email: '', password: '', role: 'USER' });
            fetchUsers();
        } catch (error) {
            console.error('Error al crear usuario:', error);
            const msg = error.response?.data?.message || 'Error al crear usuario';
            toast.error(msg);
        }
    };

    return (
        <div className="users-dashboard-container">
            <ToastContainer autoClose={2000} position="top-right" />

            <div className="users-top-bar">
                <div>
                    <h2><FaUserShield /> Usuarios y Roles</h2>
                    <p className="users-subtitle">Gestión de accesos, cajeros y personal administrativo</p>
                </div>
                <button className="btn-add-user" onClick={() => setShowModal(true)}>
                    <FaUserPlus /> Nuevo Usuario
                </button>
            </div>

            <div className="users-table-card">
                <div className="table-responsive">
                    {loading ? (
                        <div className="users-loading">
                            <div className="loading-spinner"></div>
                            <p>Cargando lista de usuarios...</p>
                        </div>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Correo Electrónico</th>
                                    <th>Rol Asignado</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => {
                                    const isAdminRole = u.role?.toUpperCase() === 'ADMIN';
                                    const initial = u.username ? u.username.charAt(0).toUpperCase() : 'U';

                                    return (
                                        <tr key={u.id}>
                                            <td className="user-name-cell">
                                                <div className="user-avatar-circle">
                                                    {initial}
                                                </div>
                                                <div className="user-name-meta">
                                                    <strong>{u.username}</strong>
                                                    <span className="user-id-sub">ID #{u.id}</span>
                                                </div>
                                            </td>
                                            <td className="user-email-cell">{u.email}</td>
                                            <td>
                                                <span className={`user-role-chip ${isAdminRole ? 'admin' : 'cashier'}`}>
                                                    {isAdminRole ? 'Administrador' : 'Cajero / POS'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className="user-status-active">
                                                    <FaUserCheck /> Activo
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn-delete-user"
                                                    onClick={() => handleDelete(u.id, u.username)}
                                                    title="Eliminar Usuario"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {users.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="5" className="empty-users-cell">
                                            <p>No hay usuarios registrados.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content user-modal-box">
                        <div className="user-modal-header">
                            <h3><FaUserPlus /> Registrar Nuevo Usuario</h3>
                            <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="form-group-user">
                                <label><FaUser /> Nombre de Usuario</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    placeholder="Ej: cajero_turno1"
                                    autoFocus
                                />
                            </div>

                            <div className="form-group-user">
                                <label><FaEnvelope /> Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="cajero@marketcali.com"
                                />
                            </div>

                            <div className="form-group-user">
                                <label><FaLock /> Contraseña de Acceso</label>
                                <input
                                    type="password"
                                    required
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="••••••••"
                                    minLength="4"
                                />
                            </div>

                            <div className="form-group-user">
                                <label><FaUserShield /> Rol en el Sistema</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="USER">Cajero / Operador POS (USER)</option>
                                    <option value="ADMIN">Administrador Total (ADMIN)</option>
                                </select>
                            </div>

                            <div className="user-modal-actions">
                                <button type="button" className="btn-user-cancel" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-user-save">
                                    Guardar Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
