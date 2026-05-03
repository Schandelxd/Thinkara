import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopNav from './TopNav.jsx';
import AIAssistantOverlay from '../AIAssistantOverlay.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useStore } from '../../store/useStore.js';

export default function MainLayout() {
  const { user } = useAuth();
  const { initUserData, isSidebarOpen, closeSidebar } = useStore();

  useEffect(() => {
    if (user) {
      initUserData(user.id, user.email, user.user_metadata?.full_name);
    }
  }, [user, initUserData]);

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)', overflow: 'hidden' }}>
      
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div className="sidebar-overlay mobile-only" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>
      
      {/* Main Content Area with animated background */}
      <div className="page-bg" style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '0' }}>
        {/* Floating geometric shapes */}
        <div className="geo-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
        
        <TopNav />
        <main className="page-padding" style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
          <Outlet />
        </main>
      </div>
      
      {/* Global AI Chat Assistant */}
      <AIAssistantOverlay />
    </div>
  );
}
