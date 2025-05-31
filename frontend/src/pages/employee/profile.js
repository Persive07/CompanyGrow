import React, { useState, useEffect } from 'react';
import { User, Edit3, Phone, Mail, MapPin, Users, Award, Calendar, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import makeAuthenticatedRequest from '../../utils/api';
const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Get user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem('id');
  };

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = getUserId();
        
        if (!userId || !token) {
          console.error('No user ID or token found');
          setError('Authentication required. Please login again.');
          setLoading(false);
          return;
        }

        const response = await makeAuthenticatedRequest(`/api/user/getProfile/${userId}`);

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setEditData(data);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(`Failed to load profile: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(`Network error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditToggle = () => {
    setShowEditForm(!showEditForm);
    if (!showEditForm) {
      setEditData(userData); // Reset edit data when opening form
    }
  };

  const handleInputChange = (field, value, nestedField = null) => {
    if (nestedField) {
      setEditData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nestedField]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSkillsChange = (value) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setEditData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();

      // Prepare data for backend (exclude read-only fields)
      const updateData = {
        name: editData.name,
        phone: editData.phone,
        department: editData.department,
        position: editData.position,
        experience: editData.experience,
        skills: editData.skills,
        address: editData.address,
        emergencyContact: editData.emergencyContact
      };

      const response = await makeAuthenticatedRequest(`/api/user/modifyProfile/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const responseData = await response.json();
        setUserData(responseData.user);
        setShowEditForm(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error updating profile: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getBadgeColor = (title) => {
    const colors = {
      'Green': '#10b981',
      'Cyan': '#06b6d4',
      'Blue': '#3b82f6',
      'Purple': '#8b5cf6',
      'Red': '#ef4444'
    };
    return colors[title] || '#6b7280';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { backgroundColor: '#10b981', color: 'white' };
      case 'in-progress': return { backgroundColor: '#f59e0b', color: 'white' };
      case 'pending': return { backgroundColor: '#6b7280', color: 'white' };
      default: return { backgroundColor: '#6b7280', color: 'white' };
    }
  };

  // Updated styles to match Employee Dashboard
  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    
    header: {
      backgroundColor: '#667eea',
      color: 'white',
      padding: '32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    },
    
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      fontWeight: 'bold',
      border: '3px solid rgba(255, 255, 255, 0.3)'
    },
    
    headerInfo: {
      flex: 1
    },
    
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      margin: '0 0 8px 0'
    },
    
    subtitle: {
      fontSize: '18px',
      opacity: 0.9,
      margin: 0
    },
    
    editButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    
    editButtonHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.5)'
    },
    
    editButtonDisabled: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    
    content: {
      padding: '32px'
    },
    
    profileGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    
    section: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    },
    
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: '2px solid #e5e7eb'
    },
    
    sectionIcon: {
      color: '#667eea'
    },
    
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    
    infoGrid: {
      display: 'grid',
      gap: '16px'
    },
    
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    
    infoIcon: {
      color: '#667eea',
      flexShrink: 0
    },
    
    infoContent: {
      flex: 1,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    
    label: {
      fontWeight: '600',
      color: '#374151',
      fontSize: '14px'
    },
    
    value: {
      color: '#1f2937',
      fontSize: '14px',
      fontWeight: '500'
    },
    
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '16px'
    },
    
    skillTag: {
      backgroundColor: '#667eea',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '600'
    },
    
    performanceSection: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      marginTop: '24px'
    },
    
    performanceCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '16px',
      border: '1px solid #e5e7eb'
    },
    
    performanceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid #e5e7eb'
    },
    
    periodBadge: {
      backgroundColor: '#667eea',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600'
    },
    
    goalsList: {
      marginTop: '16px'
    },
    
    goalItem: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px',
      border: '1px solid #e5e7eb'
    },
    
    goalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    
    goalTitle: {
      fontWeight: '600',
      color: '#1f2937',
      fontSize: '16px'
    },
    
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    
    goalDescription: {
      color: '#6b7280',
      fontSize: '14px',
      margin: '8px 0 0 0',
      lineHeight: '1.5'
    },
    
    badgesContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '16px'
    },
    
    badge: {
      padding: '6px 12px',
      borderRadius: '16px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'help'
    },
    
    feedbackSection: {
      marginTop: '16px',
      padding: '16px',
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #bae6fd'
    },
    
    feedbackTitle: {
      color: '#1f2937',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    
    feedbackText: {
      color: '#374151',
      fontSize: '14px',
      fontStyle: 'italic',
      lineHeight: '1.5',
      margin: 0
    },
    
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflow: 'auto',
      width: '100%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    
    modalHeader: {
      backgroundColor: '#667eea',
      color: 'white',
      padding: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0
    },
    
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '4px',
      transition: 'background-color 0.3s ease'
    },
    
    modalContent: {
      padding: '32px'
    },
    
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    
    formSection: {
      marginBottom: '32px'
    },
    
    formSectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '2px solid #e5e7eb'
    },
    
    formGroup: {
      marginBottom: '20px'
    },
    
    formLabel: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#374151',
      fontSize: '14px'
    },
    
    formInput: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.3s ease',
      boxSizing: 'border-box'
    },
    
    formInputFocus: {
      borderColor: '#667eea',
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    },
    
    formActions: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'flex-end',
      marginTop: '32px',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb'
    },
    
    saveButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'background-color 0.3s ease'
    },
    
    saveButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    
    cancelButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'background-color 0.3s ease'
    },
    
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 32px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    
    loadingTitle: {
      fontSize: '24px',
      color: '#1f2937',
      marginBottom: '16px'
    },
    
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto'
    },
    
    errorContainer: {
      textAlign: 'center',
      padding: '64px 32px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    
    errorTitle: {
      color: '#ef4444',
      fontSize: '24px',
      marginBottom: '16px'
    },
    
    errorText: {
      color: '#6b7280',
      fontSize: '16px',
      marginBottom: '24px'
    },
    
    retryButton: {
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600'
    },
    
    noDataMessage: {
      textAlign: 'center',
      padding: '48px 32px',
      color: '#6b7280',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '2px dashed #e5e7eb'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <h2 style={styles.loadingTitle}>Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Error Loading Profile</h2>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2>Profile not found</h2>
          <p>Unable to load profile data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>
            {userData.name ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
          </div>
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>{userData.name}</h1>
            <p style={styles.subtitle}>{userData.position} • {userData.department}</p>
          </div>
        </div>
        <button 
          style={{
            ...styles.editButton,
            ...(saving ? styles.editButtonDisabled : {})
          }}
          onClick={handleEditToggle}
          disabled={saving}
        >
          <Edit3 size={20} />
          {saving ? 'Saving...' : 'Edit Profile'}
        </button>
      </div>

      <div style={styles.content}>
        {/* Profile Information Grid */}
        <div style={styles.profileGrid}>
          {/* Basic Information */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <User size={20} style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Basic Information</h2>
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <Mail size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Email</span>
                  <span style={styles.value}>{userData.email}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Phone size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Phone</span>
                  <span style={styles.value}>{userData.phone || 'Not provided'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Award size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Role</span>
                  <span style={styles.value}>{userData.role}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <CheckCircle size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Status</span>
                  <span style={styles.value}>{userData.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Calendar size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Last Login</span>
                  <span style={styles.value}>{formatDate(userData.lastLogin)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Award size={20} style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Professional Information</h2>
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <Users size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Department</span>
                  <span style={styles.value}>{userData.department || 'Not specified'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <User size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Position</span>
                  <span style={styles.value}>{userData.position || 'Not specified'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Calendar size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Experience</span>
                  <span style={styles.value}>{userData.experience} years</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Calendar size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Join Date</span>
                  <span style={styles.value}>{formatDate(userData.joinDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Competencies */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Award size={20} style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Skills & Competencies</h2>
            </div>
            <div style={styles.skillsContainer}>
              {userData.skills && userData.skills.length > 0 ? (
                userData.skills.map((skill, index) => (
                  <span key={index} style={styles.skillTag}>
                    {skill}
                  </span>
                ))
              ) : (
                <div style={styles.noDataMessage}>
                  <p>No skills listed</p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <MapPin size={20} style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Address Information</h2>
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <MapPin size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Street</span>
                  <span style={styles.value}>{userData.address?.street || 'Not provided'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <MapPin size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>City</span>
                  <span style={styles.value}>{userData.address?.city || 'Not provided'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <MapPin size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>State</span>
                  <span style={styles.value}>{userData.address?.state || 'Not provided'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <MapPin size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Zip Code</span>
                  <span style={styles.value}>{userData.address?.zipCode || 'Not provided'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <MapPin size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Country</span>
                  <span style={styles.value}>{userData.address?.country || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <AlertCircle size={20} style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Emergency Contact</h2>
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <User size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Name</span>
                  <span style={styles.value}>{userData.emergencyContact?.name || 'Not provided'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Users size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Relationship</span>
                  <span style={styles.value}>{userData.emergencyContact?.relationship || 'Not provided'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Phone size={16} style={styles.infoIcon} />
                <div style={styles.infoContent}>
                  <span style={styles.label}>Phone</span>
                  <span style={styles.value}>{userData.emergencyContact?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {userData.performanceMetrics && userData.performanceMetrics.length > 0 && (
          <div style={styles.performanceSection}>
            <div style={styles.sectionHeader}>
              <Award size={20} style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Performance History</h2>
            </div>
            {userData.performanceMetrics.map((metric, index) => (
              <div key={index} style={styles.performanceCard}>
                <div style={styles.performanceHeader}>
                  <h4 style={{margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: '600'}}>
                    Performance Period
                  </h4>
                  <span style={styles.periodBadge}>{metric.period}</span>
                </div>
                
                {/* Goals */}
                {metric.goals && metric.goals.length > 0 && (
                  <div style={styles.goalsList}>
                    <h4 style={{color: '#1f2937', marginBottom: '16px', fontSize: '16px', fontWeight: '600'}}>
                      Goals:
                    </h4>
                    {metric.goals.map((goal, goalIndex) => (
                      <div key={goalIndex} style={styles.goalItem}>
                        <div style={styles.goalHeader}>
                          <h5 style={styles.goalTitle}>{goal.title}</h5>
                          <span style={{...styles.statusBadge, ...getStatusColor(goal.status)}}>
                            {goal.status}
                          </span>
                        </div>
                        <p style={styles.goalDescription}>{goal.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Badges */}
                {metric.badgesEarned && metric.badgesEarned.length > 0 && (
                  <div style={{marginTop: '20px'}}>
                    <h4 style={{color: '#1f2937', marginBottom: '16px', fontSize: '16px', fontWeight: '600'}}>
                      Badges Earned:
                    </h4>
                    <div style={styles.badgesContainer}>
                      {metric.badgesEarned.map((badge, badgeIndex) => (
                        <span 
                          key={badgeIndex} 
                          style={{
                            ...styles.badge,
                            backgroundColor: getBadgeColor(badge.title)
                          }}
                          title={`${badge.description} - Earned: ${formatDate(badge.dateEarned)}`}
                        >
                          {badge.title} ({badge.type})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {metric.feedback && (
                  <div style={styles.feedbackSection}>
                    <h4 style={styles.feedbackTitle}>Feedback:</h4>
                    <p style={styles.feedbackText}>{metric.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Profile</h2>
              <button 
                style={styles.closeButton}
                onClick={handleEditToggle}
                disabled={saving}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.formGrid}>
                {/* Basic Information Form */}
                <div style={styles.formSection}>
                  <h3 style={styles.formSectionTitle}>Basic Information</h3>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Name:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Phone:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Department:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Position:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.position || ''}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Experience (years):</label>
                    <input
                      type="number"
                      style={styles.formInput}
                      value={editData.experience || 0}
                      onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Skills (comma-separated):</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.skills ? editData.skills.join(', ') : ''}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div style={styles.formSection}>
                  <h3 style={styles.formSectionTitle}>Address Information</h3>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Street:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.address?.street || ''}
                      onChange={(e) => handleInputChange('address', e.target.value, 'street')}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>City:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.address?.city || ''}
                      onChange={(e) => handleInputChange('address', e.target.value, 'city')}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>State:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.address?.state || ''}
                      onChange={(e) => handleInputChange('address', e.target.value, 'state')}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Zip Code:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.address?.zipCode || ''}
                      onChange={(e) => handleInputChange('address', e.target.value, 'zipCode')}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Country:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.address?.country || ''}
                      onChange={(e) => handleInputChange('address', e.target.value, 'country')}
                    />
                  </div>

                  {/* Emergency Contact */}
                  <h3 style={styles.formSectionTitle}>Emergency Contact</h3>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Name:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.emergencyContact?.name || ''}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value, 'name')}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Relationship:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.emergencyContact?.relationship || ''}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value, 'relationship')}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Phone:</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editData.emergencyContact?.phone || ''}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value, 'phone')}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={styles.formActions}>
                <button 
                  style={styles.cancelButton}
                  onClick={handleEditToggle}
                  disabled={saving}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button 
                  style={{
                    ...styles.saveButton,
                    ...(saving ? styles.saveButtonDisabled : {})
                  }}
                  onClick={handleSaveChanges}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Profile;
