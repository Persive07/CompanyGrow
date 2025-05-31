import React, { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Pause, ChevronRight } from 'lucide-react';
import UserSelection from './userSelection';
import makeAuthenticatedRequest from '../../utils/api';
const Manage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [selectedProjectForAssignment, setSelectedProjectForAssignment] = useState(null);
  const [completingProject, setCompletingProject] = useState(null);

  // Get user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem('id');
  };

  // Fetch projects managed by this manager
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const managerId = getUserId();

        if (!token || !managerId) {
          console.error('No token or manager ID found');
          setLoading(false);
          return;
        }

        const response = await makeAuthenticatedRequest('/api/project/getAllProjects');

        if (response.ok) {
          const data = await response.json();
          const managedProjects = data.projects.filter(
            project => project.managedBy && project.managedBy._id === managerId
          );
          setProjects(managedProjects);
        } else {
          console.error('Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Handle project completion
  const handleCompleteProject = async (projectId) => {
    setCompletingProject(projectId);
    try {
      const token = localStorage.getItem('token');

      const response = await makeAuthenticatedRequest(`/api/project/completeProject/${projectId}`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Project marked as completed successfully!');
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to complete project'}`);
      }
    } catch (error) {
      console.error('Error completing project:', error);
      alert('Error completing project. Please try again.');
    } finally {
      setCompletingProject(null);
    }
  };

  // Handle user assignment
  const handleAssignUsers = (project) => {
    setSelectedProjectForAssignment(project);
    setShowUserSelection(true);
  };

  const handleAssignmentConfirm = () => {
    setShowUserSelection(false);
    setSelectedProjectForAssignment(null);
    window.location.reload();
  };

  // Toggle expanded project users
  const toggleExpandedProject = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  // Get badge color
  const getBadgeColor = (badgeTitle) => {
    const colors = {
      'Green': '#10b981',
      'Cyan': '#06b6d4',
      'Blue': '#3b82f6',
      'Purple': '#8b5cf6',
      'Red': '#ef4444'
    };
    return colors[badgeTitle] || '#6b7280';
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    const statusMap = {
      'planning': { color: '#6b7280', icon: Clock, label: 'Planning' },
      'in-progress': { color: '#f59e0b', icon: AlertCircle, label: 'In Progress' },
      'on-hold': { color: '#ef4444', icon: Pause, label: 'On Hold' },
      'completed': { color: '#10b981', icon: CheckCircle, label: 'Completed' }
    };
    return statusMap[status] || statusMap['planning'];
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    return colors[priority] || '#6b7280';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Group projects by status
  const getGroupedProjects = () => {
    const ongoing = projects.filter(p => p.status === 'in-progress');
    const onHold = projects.filter(p => p.status === 'on-hold');
    const completed = projects.filter(p => p.status === 'completed');
    
    return { ongoing, onHold, completed };
  };

  // Updated styles to match dashboard
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
      textAlign: 'center'
    },
    
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '8px',
      margin: 0
    },
    
    subtitle: {
      fontSize: '18px',
      opacity: 0.9,
      margin: 0
    },
    
    content: {
      padding: '32px'
    },
    
    section: {
      marginBottom: '32px'
    },
    
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
      paddingBottom: '12px',
      borderBottom: '2px solid #e5e7eb'
    },
    
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    
    sectionIcon: {
      color: '#667eea'
    },
    
    projectsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px'
    },
    
    projectCard: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    
    projectCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    },
    
    projectHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    
    projectTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0,
      flex: 1
    },
    
    statusContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px'
    },
    
    statusBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    
    badgeReward: {
      padding: '4px 12px',
      borderRadius: '16px',
      color: 'white',
      fontSize: '11px',
      fontWeight: '600'
    },
    
    description: {
      color: '#6b7280',
      marginBottom: '20px',
      lineHeight: '1.6',
      fontSize: '14px'
    },
    
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '20px'
    },
    
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    
    infoIcon: {
      color: '#667eea'
    },
    
    infoContent: {
      flex: 1
    },
    
    infoLabel: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    infoValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937'
    },
    
    priorityBadge: {
      padding: '2px 8px',
      borderRadius: '12px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    
    usersSection: {
      marginTop: '20px',
      borderTop: '1px solid #e5e7eb',
      paddingTop: '20px'
    },
    
    usersHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      marginBottom: '12px',
      padding: '8px',
      borderRadius: '6px',
      transition: 'background-color 0.2s'
    },
    
    usersHeaderHover: {
      backgroundColor: '#f3f4f6'
    },
    
    usersCount: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    
    expandIcon: {
      color: '#667eea',
      transition: 'transform 0.2s ease'
    },
    
    expandIconRotated: {
      transform: 'rotate(90deg)'
    },
    
    usersList: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '8px'
    },
    
    userItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f3f4f6'
    },
    
    userInfo: {
      flex: 1
    },
    
    userName: {
      fontWeight: '600',
      color: '#1f2937',
      fontSize: '14px'
    },
    
    userEmail: {
      fontSize: '12px',
      color: '#6b7280'
    },
    
    userRole: {
      fontSize: '12px',
      color: '#667eea',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    
    actionsContainer: {
      marginTop: '20px',
      display: 'flex',
      gap: '12px'
    },
    
    actionButton: {
      flex: 1,
      padding: '12px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    
    completeButton: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    
    completeButtonHover: {
      backgroundColor: '#059669'
    },
    
    assignButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    
    assignButtonHover: {
      backgroundColor: '#2563eb'
    },
    
    loadingContainer: {
      textAlign: 'center',
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
    
    noProjects: {
      textAlign: 'center',
      padding: '48px 32px',
      color: '#6b7280',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    
    noProjectsText: {
      fontSize: '16px',
      margin: 0
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <h2 style={styles.loadingTitle}>Loading your projects...</h2>
        </div>
      </div>
    );
  }

  const { ongoing, onHold, completed } = getGroupedProjects();

  const renderProject = (project, showActions = false) => {
    const statusInfo = getStatusInfo(project.status);
    const StatusIcon = statusInfo.icon;
    
    return (
      <div key={project._id} style={styles.projectCard}>
        {/* Project Header */}
        <div style={styles.projectHeader}>
          <h3 style={styles.projectTitle}>{project.name}</h3>
          <div style={styles.statusContainer}>
            <div 
              style={{
                ...styles.statusBadge,
                backgroundColor: statusInfo.color
              }}
            >
              <StatusIcon size={14} />
              {statusInfo.label}
            </div>
            {project.badgeReward && (
              <span 
                style={{
                  ...styles.badgeReward,
                  backgroundColor: getBadgeColor(project.badgeReward)
                }}
              >
                {project.badgeReward}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p style={styles.description}>{project.description}</p>

        {/* Project Info */}
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <AlertCircle size={16} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <div style={styles.infoLabel}>Priority</div>
              <span 
                style={{
                  ...styles.priorityBadge,
                  backgroundColor: getPriorityColor(project.priority)
                }}
              >
                {project.priority}
              </span>
            </div>
          </div>
          
          <div style={styles.infoItem}>
            <DollarSign size={16} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <div style={styles.infoLabel}>Budget</div>
              <div style={styles.infoValue}>{formatCurrency(project.budget)}</div>
            </div>
          </div>
          
          <div style={styles.infoItem}>
            <Calendar size={16} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <div style={styles.infoLabel}>
                {project.status === 'completed' ? 'Completed' : 'Due Date'}
              </div>
              <div style={styles.infoValue}>
                {project.status === 'completed' 
                  ? formatDate(project.updatedAt)
                  : formatDate(project.deadline)
                }
              </div>
            </div>
          </div>
          
          <div style={styles.infoItem}>
            <Users size={16} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <div style={styles.infoLabel}>Team Size</div>
              <div style={styles.infoValue}>{project.assignedUsers.length} members</div>
            </div>
          </div>
        </div>

        {/* Assigned Users Section */}
        <div style={styles.usersSection}>
          <div 
            style={styles.usersHeader}
            onClick={() => toggleExpandedProject(project._id)}
          >
            <span style={styles.usersCount}>
              Assigned Users ({project.assignedUsers.length})
            </span>
            <ChevronRight 
              size={16}
              style={{
                ...styles.expandIcon,
                ...(expandedProject === project._id ? styles.expandIconRotated : {})
              }}
            />
          </div>

          {expandedProject === project._id && (
            <div style={styles.usersList}>
              {project.assignedUsers.length === 0 ? (
                <div style={{textAlign: 'center', color: '#6b7280', fontSize: '14px'}}>
                  No users assigned
                </div>
              ) : (
                project.assignedUsers.map((user) => (
                  <div key={user._id} style={styles.userItem}>
                    <div style={styles.userInfo}>
                      <div style={styles.userName}>{user.name}</div>
                      <div style={styles.userEmail}>{user.email}</div>
                    </div>
                    <div style={styles.userRole}>{user.role}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div style={styles.actionsContainer}>
            <button
              style={{...styles.actionButton, ...styles.completeButton}}
              onClick={() => handleCompleteProject(project._id)}
              disabled={completingProject === project._id}
            >
              <CheckCircle size={16} />
              {completingProject === project._id ? 'Completing...' : 'Mark Complete'}
            </button>
            <button
              style={{...styles.actionButton, ...styles.assignButton}}
              onClick={() => handleAssignUsers(project)}
            >
              <Users size={16} />
              Manage Team
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Project Management</h1>
        <p style={styles.subtitle}>Manage your team's projects and assignments</p>
      </div>

      <div style={styles.content}>
        {/* Ongoing Projects */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <AlertCircle size={24} style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>Ongoing Projects</h2>
          </div>
          {ongoing.length === 0 ? (
            <div style={styles.noProjects}>
              <p style={styles.noProjectsText}>No ongoing projects</p>
            </div>
          ) : (
            <div style={styles.projectsGrid}>
              {ongoing.map(project => renderProject(project, true))}
            </div>
          )}
        </div>

        {/* On Hold Projects */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Pause size={24} style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>On Hold Projects</h2>
          </div>
          {onHold.length === 0 ? (
            <div style={styles.noProjects}>
              <p style={styles.noProjectsText}>No projects on hold</p>
            </div>
          ) : (
            <div style={styles.projectsGrid}>
              {onHold.map(project => renderProject(project, true))}
            </div>
          )}
        </div>

        {/* Completed Projects */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <CheckCircle size={24} style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>Completed Projects</h2>
          </div>
          {completed.length === 0 ? (
            <div style={styles.noProjects}>
              <p style={styles.noProjectsText}>No completed projects</p>
            </div>
          ) : (
            <div style={styles.projectsGrid}>
              {completed.map(project => renderProject(project, false))}
            </div>
          )}
        </div>
      </div>

      {/* User Selection Modal */}
      {showUserSelection && selectedProjectForAssignment && (
        <UserSelection
          projectId={selectedProjectForAssignment._id}
          currentAssignedUsers={selectedProjectForAssignment.assignedUsers}
          onClose={() => setShowUserSelection(false)}
          onConfirm={handleAssignmentConfirm}
        />
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

export default Manage;
