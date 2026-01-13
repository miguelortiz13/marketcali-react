import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        // Basic validation (In a real app, you'd hit an endpoint to verify credentials)
        if (username === 'admin' && password === 'admin') {
            const token = 'Basic ' + btoa(username + ':' + password);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ username, role: 'ADMIN' }));
            navigate('/admin/productos');
        } else if (username === 'user' && password === 'user') {
            const token = 'Basic ' + btoa(username + ':' + password);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ username, role: 'USER' }));
            navigate('/');
        } else {
            setError('Credenciales inválidas');
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
