import React, { useState, useEffect } from 'react';
import makeAuthenticatedRequest from '../../utils/api';
const CatalogProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        const response = await makeAuthenticatedRequest('/api/project/getAllProjects');

        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
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

  // Toggle expanded project users
  const toggleExpandedProject = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  // Get badge color
  const getBadgeColor = (badgeTitle) => {
    const colors = {
      'Green': '#27ae60',
      'Cyan': '#17a2b8',
      'Blue': '#007bff',
      'Purple': '#6f42c1',
      'Red': '#dc3545'
    };
    return colors[badgeTitle] || '#6c757d';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'planning': '#95a5a6',
      'in-progress': '#f39c12',
      'on-hold': '#e74c3c',
      'completed': '#27ae60'
    };
    return colors[status] || '#95a5a6';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#27ae60',
      'medium': '#f39c12',
      'high': '#e74c3c'
    };
    return colors[priority] || '#95a5a6';
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

  // Styles
  const styles = {
    container: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginTop: '2rem'
    },
    title: {
      fontSize: '2rem',
      color: '#2c3e50',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    projectsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem'
    },
    projectCard: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '1.5rem',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    projectCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
    },
    projectHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    projectName: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: 0,
      flex: 1
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      textTransform: 'capitalize'
    },
    description: {
      color: '#7f8c8d',
      marginBottom: '1rem',
      lineHeight: '1.5'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    infoItem: {
      fontSize: '0.9rem'
    },
    infoLabel: {
      fontWeight: 'bold',
      color: '#34495e'
    },
    infoValue: {
      color: '#2c3e50'
    },
    priorityBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '3px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      textTransform: 'capitalize'
    },
    badgeReward: {
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      display: 'inline-block'
    },
    skillsContainer: {
      marginBottom: '1rem'
    },
    skillsTitle: {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      color: '#34495e',
      marginBottom: '0.5rem'
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    skillTag: {
      backgroundColor: '#3498db',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.75rem'
    },
    usersSection: {
      marginTop: '1rem',
      borderTop: '1px solid #dee2e6',
      paddingTop: '1rem'
    },
    usersHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      marginBottom: '0.5rem'
    },
    usersCount: {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      color: '#34495e'
    },
    expandArrow: {
      fontSize: '1.2rem',
      color: '#3498db',
      transition: 'transform 0.2s ease'
    },
    expandArrowRotated: {
      transform: 'rotate(90deg)'
    },
    usersList: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '5px',
      padding: '1rem',
      marginTop: '0.5rem'
    },
    userItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid #ecf0f1'
    },
    userItemLast: {
      borderBottom: 'none'
    },
    userName: {
      fontWeight: 'bold',
      color: '#2c3e50'
    },
    userEmail: {
      fontSize: '0.8rem',
      color: '#7f8c8d'
    },
    userRole: {
      fontSize: '0.8rem',
      color: '#3498db',
      textTransform: 'capitalize'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '2rem',
      color: '#7f8c8d'
    },
    noProjects: {
      textAlign: 'center',
      padding: '2rem',
      color: '#7f8c8d'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '0.75rem',
      marginBottom: '1rem'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Projects</h2>
        <div style={styles.loadingContainer}>
          <h3>Loading projects...</h3>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Projects</h2>
        <div style={styles.noProjects}>
          <h3>No projects available</h3>
          <p>There are currently no projects to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Projects</h2>
      
      <div style={styles.projectsGrid}>
        {projects.map((project) => (
          <div key={project._id} style={styles.projectCard}>
            {/* Project Header */}
            <div style={styles.projectHeader}>
              <h3 style={styles.projectName}>{project.name}</h3>
              <span 
                style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(project.status)
                }}
              >
                {project.status}
              </span>
            </div>

            {/* Description */}
            <p style={styles.description}>{project.description}</p>

            {/* Basic Info Grid */}
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Priority: </span>
                <span 
                  style={{
                    ...styles.priorityBadge,
                    backgroundColor: getPriorityColor(project.priority)
                  }}
                >
                  {project.priority}
                </span>
              </div>
              
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Badge: </span>
                {project.badgeReward ? (
                  <span 
                    style={{
                      ...styles.badgeReward,
                      backgroundColor: getBadgeColor(project.badgeReward)
                    }}
                  >
                    {project.badgeReward}
                  </span>
                ) : (
                  <span style={styles.infoValue}>None</span>
                )}
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div style={styles.detailsGrid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Due Date:</div>
                <div style={styles.infoValue}>{formatDate(project.deadline)}</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Budget:</div>
                <div style={styles.infoValue}>{formatCurrency(project.budget)}</div>
              </div>
              
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Created:</div>
                <div style={styles.infoValue}>{formatDate(project.createdAt)}</div>
              </div>
            </div>

            {/* Manager Info */}
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Managed By: </span>
              <span style={styles.infoValue}>
                {project.managedBy ? project.managedBy.name : 'Not assigned'}
              </span>
            </div>

            {/* Skills Required */}
            {project.skillsRequired && project.skillsRequired.length > 0 && (
              <div style={styles.skillsContainer}>
                <div style={styles.skillsTitle}>Skills Required:</div>
                <div style={styles.skillsList}>
                  {project.skillsRequired.map((skill, index) => (
                    <span key={index} style={{...styles.skillTag, backgroundColor: '#e74c3c'}}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Gained */}
            {project.skillsGained && project.skillsGained.length > 0 && (
              <div style={styles.skillsContainer}>
                <div style={styles.skillsTitle}>Skills Gained:</div>
                <div style={styles.skillsList}>
                  {project.skillsGained.map((skill, index) => (
                    <span key={index} style={{...styles.skillTag, backgroundColor: '#27ae60'}}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Users Section */}
            <div style={styles.usersSection}>
              <div 
                style={styles.usersHeader}
                onClick={() => toggleExpandedProject(project._id)}
              >
                <span style={styles.usersCount}>
                  Assigned Users: {project.assignedUsers.length}
                </span>
                <span 
                  style={{
                    ...styles.expandArrow,
                    ...(expandedProject === project._id ? styles.expandArrowRotated : {})
                  }}
                >
                  ▶
                </span>
              </div>

              {/* Expanded Users List */}
              {expandedProject === project._id && (
                <div style={styles.usersList}>
                  {project.assignedUsers.length === 0 ? (
                    <div style={{textAlign: 'center', color: '#7f8c8d'}}>
                      No users assigned
                    </div>
                  ) : (
                    project.assignedUsers.map((user, index) => (
                      <div 
                        key={user._id} 
                        style={{
                          ...styles.userItem,
                          ...(index === project.assignedUsers.length - 1 ? styles.userItemLast : {})
                        }}
                      >
                        <div>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogProjects;
