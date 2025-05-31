import React, { useState } from 'react';
import { Settings, Users, BookOpen, FolderOpen, LogOut, User } from 'lucide-react';
import Catalog from './catalog';
import Manage from './manage';
import Review from './review';
import Profile from './profile';
import makeAuthenticatedRequest from '../../utils/api';
const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [hoveredTab, setHoveredTab] = useState(null);
  const [logoutHovered, setLogoutHovered] = useState(false);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('id');
    window.location.href = '/';
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'catalog':
        return <Catalog />;
      case 'manage':
        return <Manage />;
      case 'review':
        return <Review />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <div style={styles.welcomeSection}>
            <h2 style={styles.welcomeTitle}>Welcome to Manager Dashboard</h2>
            <p style={styles.welcomeText}>
              Manage your team's training, projects, and performance from this central hub.
            </p>
            
            <div style={styles.quickStats}>
              <div style={styles.statCard}>
                <div style={styles.statCardIcon}>
                  <BookOpen size={24} />
                </div>
                <h3 style={styles.statCardTitle}>Training Catalog Management</h3>
                <p style={styles.statCardText}>
                  Browse and assign training courses to team members. Monitor course completion rates, track skill development progress, and ensure compliance with organizational learning objectives.
                </p>
              </div>
              
              <div style={styles.statCard}>
                <div style={styles.statCardIcon}>
                  <FolderOpen size={24} />
                </div>
                <h3 style={styles.statCardTitle}>Project Management & Oversight</h3>
                <p style={styles.statCardText}>
                  Oversee project assignments, track progress milestones, manage team collaboration, and ensure timely delivery of project objectives with comprehensive status monitoring.
                </p>
              </div>
              
              <div style={styles.statCard}>
                <div style={styles.statCardIcon}>
                  <Users size={24} />
                </div>
                <h3 style={styles.statCardTitle}>Performance Review & Analytics</h3>
                <p style={styles.statCardText}>
                  Conduct comprehensive performance evaluations, set strategic goals, manage team development initiatives, and analyze performance metrics to drive continuous improvement.
                </p>
              </div>
              
              <div style={styles.statCard}>
                <div style={styles.statCardIcon}>
                  <User size={24} />
                </div>
                <h3 style={styles.statCardTitle}>Team Overview & Insights</h3>
                <p style={styles.statCardText}>
                  Get comprehensive insights into team performance metrics, badge achievements, skill progression, and overall productivity to make informed management decisions.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  const getTabStyle = (tabName) => {
    const isActive = activeTab === tabName;
    const isHovered = hoveredTab === tabName;
    
    return {
      ...styles.navTab,
      ...(isActive ? styles.navTabActive : {}),
      ...(isHovered && !isActive ? styles.navTabHover : {})
    };
  };

  // Updated styles to match Admin Dashboard
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    
    navbar: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    },
    
    navContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px'
    },
    
    navBrand: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    
    navTabs: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    
    navTab: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#6b7280'
    },
    
    navTabActive: {
      backgroundColor: '#667eea',
      color: 'white'
    },
    
    navTabHover: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none',
      backgroundColor: '#ef4444',
      color: 'white'
    },
    
    logoutButtonHover: {
      backgroundColor: '#dc2626'
    },
    
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px'
    },
    
    content: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    
    welcomeSection: {
      backgroundColor: 'white',
      padding: '32px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    },
    
    welcomeTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '12px',
      textAlign: 'center'
    },
    
    welcomeText: {
      color: '#6b7280',
      fontSize: '18px',
      textAlign: 'center',
      marginBottom: '32px',
      lineHeight: '1.6'
    },
    
    quickStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px'
    },
    
    statCard: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    
    statCardIcon: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '48px',
      height: '48px',
      backgroundColor: '#667eea',
      color: 'white',
      borderRadius: '12px',
      margin: '0 auto 16px auto'
    },
    
    statCardTitle: {
      color: '#1f2937',
      marginBottom: '12px',
      fontSize: '18px',
      fontWeight: '600'
    },
    
    statCardText: {
      color: '#6b7280',
      margin: 0,
      lineHeight: '1.6',
      fontSize: '14px',
      textAlign: 'left'
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.navBrand}>
            <Settings size={24} />
            Manager Dashboard
          </div>
          <div style={styles.navTabs}>
            <button 
              style={getTabStyle('catalog')}
              onMouseEnter={() => setHoveredTab('catalog')}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => handleTabClick('catalog')}
            >
              <BookOpen size={16} />
              Catalog
            </button>
            
            <button 
              style={getTabStyle('manage')}
              onMouseEnter={() => setHoveredTab('manage')}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => handleTabClick('manage')}
            >
              <Users size={16} />
              Manage
            </button>
            
            <button 
              style={getTabStyle('review')}
              onMouseEnter={() => setHoveredTab('review')}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => handleTabClick('review')}
            >
              <FolderOpen size={16} />
              Review
            </button>
            
            <button 
              style={getTabStyle('profile')}
              onMouseEnter={() => setHoveredTab('profile')}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => handleTabClick('profile')}
            >
              <User size={16} />
              Profile
            </button>
          </div>
          
          <button 
            style={{
              ...styles.logoutButton,
              ...(logoutHovered ? styles.logoutButtonHover : {})
            }}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>
      
      <main style={styles.main}>
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default ManagerDashboard;
