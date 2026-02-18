import { useState, useEffect } from 'react';
import { FaUserPlus, FaTrash, FaUserShield, FaUser } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import './UsersPage.css';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'USER' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8088/auth/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                toast.error('Error al cargar usuarios');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            const res = await fetch(`http://localhost:8088/auth/users/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Usuario eliminado');
                fetchUsers();
            } else {
                toast.error('Error al eliminar usuario');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8088/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            if (res.ok) {
                toast.success('Usuario creado exitosamente');
                setShowModal(false);
                setNewUser({ username: '', password: '', role: 'USER' });
                fetchUsers();
            } else {
                const msg = await res.text();
                toast.error(msg || 'Error al crear usuario');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    return (
        <div className="users-container">
            <ToastContainer />
            <div className="users-header">
                <h2><FaUserShield /> Gestión de Usuarios</h2>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    <FaUserPlus /> Nuevo Usuario
                </button>
            </div>

            <div className="users-list">
                {loading ? <p>Cargando...</p> : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td className="username-cell">
                                        <FaUser className="user-icon" />
                                        {user.username}
                                    </td>
                                    <td>
                                        <span className={`role-badge ${user.role?.toLowerCase()}`}>
                                            {user.role || 'USER'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(user.id)}
                                            disabled={user.role === 'ADMIN'} // Prevent deleting main admin if possible
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Nuevo Usuario</h3>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Usuario</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Rol</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="USER">Usuario</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="save-btn">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
