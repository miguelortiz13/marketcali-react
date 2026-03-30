import { useState, useEffect } from 'react';
import { FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import './Topbar.css';

const Topbar = () => {
    const [status, setStatus] = useState('offline'); // online, offline, checking
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState({ name: 'Invitado', role: 'GUEST' });

    useEffect(() => {
        // Simulating status check
        const checkStatus = async () => {
            try {
                // You can replace this with a real fetch to a health endpoint
                // const res = await fetch('/actuator/health');
                // if (res.ok) setStatus('online');
                setStatus('online');
            } catch (error) {
                setStatus('offline');
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Get user from local storage or context (mocking for now)
        const token = localStorage.getItem('token');
        if (token) {
            // Here you would decode the token or fetch legacy user data
            setUser({ name: 'Admin', role: 'ADMIN' });
        }
    }, []);

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar global..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="topbar-right">
                <div className="status-indicator" title={`System Status: ${status}`}>
                    <span className={`status-dot ${status}`}></span>
                    <span className="status-text">{status === 'online' ? 'Online' : 'Offline'}</span>
                </div>

                <div className="notifications">
                    <FaBell />
                    <span className="badge">3</span>
                </div>

                <div className="user-profile">
                    <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-role">{user.role}</span>
                    </div>
                    <FaUserCircle className="user-avatar" />
                </div>
            </div>
        </header>
    );
};

export default Topbar;
