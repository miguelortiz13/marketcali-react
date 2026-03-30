import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', 'Bearer ' + data.token);
                
                // Determinamos el rol (por defecto isAdmin si es admin)
                const role = username === 'admin' ? 'ADMIN' : 'USER';
                localStorage.setItem('user', JSON.stringify({ username, role }));
                
                navigate(role === 'ADMIN' ? '/admin/productos' : '/sales');
            } else {
                const errorMsg = await res.text();
                setError(errorMsg || 'Credenciales inválidas');
            }
        } catch (error) {
            setError('Error de conexión con el servidor');
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Iniciar Sesión</h2>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label>Usuario</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn-login">Ingresar</button>
            </form>
        </div>
    );
};

export default Login;
