import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

const Layout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="layout-container">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <div className={`layout-content ${collapsed ? 'expanded' : ''}`}>
                <Topbar />
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
