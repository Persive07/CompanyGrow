import React, { useState } from 'react';
import { Settings, BookOpen, TrendingUp, BarChart3, User, LogOut } from 'lucide-react';
import Catalog from './catalog';
import Develop from './develop';
import Perf from './perf';
import Profile from './profile';
import makeAuthenticatedRequest from '../../utils/api';
const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard home
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
      case 'develop':
        return <Develop />;
      case 'performance':
        return <Perf />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <div style={styles.welcomeSection}>
            <h2 style={styles.welcomeTitle}>Welcome to Employee Dashboard</h2>
            <p style={styles.welcomeText}>
              Navigate through your personal workspace to access training, development, and performance tools.
            </p>
            
            <div style={styles.quickStats}>
              <div style={styles.statCard} onClick={() => handleTabClick('catalog')}>
                <div style={styles.statCardIcon}>
                  <BookOpen size={24} />
                </div>
                <h3 style={styles.statCardTitle}>Training Catalog & Resources</h3>
                <p style={styles.statCardText}>
                  Explore available courses, training materials, and learning resources to enhance your skills and advance your career development journey.
                </p>
              </div>
              
              <div style={styles.statCard} onClick={() => handleTabClick('develop')}>
                <div style={styles.statCardIcon}>
                  <TrendingUp size={24} />
                </div>
                <h3 style={styles.statCardTitle}>Personal Development & Growth</h3>
                <p style={styles.statCardText}>
                  Track your learning progress, set development goals, and monitor your skill advancement through personalized development pathways.
                </p>
              </div>
              
              <div style={styles.statCard} onClick={() => handleTabClick('performance')}>
                <div style={styles.statCardIcon}>
                  <BarChart3 size={24} />
                </div>
                <h3 style={styles.statCardTitle}>Performance Metrics & Analytics</h3>
                <p style={styles.statCardText}>
                  Review your performance evaluations, track achievements, analyze feedback, and monitor your professional growth metrics.
                </p>
              </div>
              
              <div style={styles.statCard} onClick={() => handleTabClick('profile')}>
                <div style={styles.statCardIcon}>
                  <User size={24} />
                </div>
                <h3 style={styles.statCardTitle}>Profile Management & Settings</h3>
                <p style={styles.statCardText}>
                  Manage your personal information, update contact details, customize preferences, and maintain your professional profile.
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
      color: '#1f2937',
      cursor: 'pointer'
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
    
    statCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
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
          <div 
            style={styles.navBrand}
            onClick={() => handleTabClick('dashboard')}
          >
            <Settings size={24} />
            Employee Dashboard
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
              style={getTabStyle('develop')}
              onMouseEnter={() => setHoveredTab('develop')}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => handleTabClick('develop')}
            >
              <TrendingUp size={16} />
              Develop
            </button>
            
            <button 
              style={getTabStyle('performance')}
              onMouseEnter={() => setHoveredTab('performance')}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => handleTabClick('performance')}
            >
              <BarChart3 size={16} />
              Performance
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

export default EmployeeDashboard;
