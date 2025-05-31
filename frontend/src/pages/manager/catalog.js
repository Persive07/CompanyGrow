import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Award, Eye, X, Play, ExternalLink, Clock, Target, AlertCircle, User } from 'lucide-react';
import makeAuthenticatedRequest from '../../utils/api';
const Catalog = () => {
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);

  // Fetch courses and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        // Fetch courses
        const coursesResponse = await makeAuthenticatedRequest('/api/course/getAllCourses');

        // Fetch projects
        const projectsResponse = await makeAuthenticatedRequest('/api/project/getAllProjects');

        if (coursesResponse.ok && projectsResponse.ok) {
          const coursesData = await coursesResponse.json();
          const projectsData = await projectsResponse.json();
          
          setCourses(coursesData);
          setProjects(projectsData.projects || []);
        } else {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle course click to show details
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
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

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'planning': '#6b7280',
      'in-progress': '#f59e0b',
      'on-hold': '#ef4444',
      'completed': '#10b981'
    };
    return colors[status] || '#6b7280';
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

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': '#10b981',
      'Intermediate': '#f59e0b',
      'Advanced': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
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
    
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px'
    },
    
    card: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    
    cardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    },
    
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    
    cardTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0,
      flex: 1
    },
    
    badge: {
      padding: '6px 12px',
      borderRadius: '16px',
      color: 'white',
      fontSize: '12px',
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
      color: '#667eea',
      flexShrink: 0
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
    
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '16px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    
    priorityBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    
    difficultyBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600'
    },
    
    skillsContainer: {
      marginBottom: '16px'
    },
    
    skillsTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    
    skillTag: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      color: 'white'
    },
    
    skillTagRequired: {
      backgroundColor: '#ef4444'
    },
    
    skillTagGained: {
      backgroundColor: '#10b981'
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
    
    usersCount: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    
    expandArrow: {
      color: '#667eea',
      transition: 'transform 0.2s ease'
    },
    
    expandArrowRotated: {
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
    
    viewButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '16px',
      padding: '12px 16px',
      backgroundColor: '#667eea',
      color: 'white',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'background-color 0.3s ease',
      border: 'none',
      cursor: 'pointer',
      width: '100%'
    },
    
    // Modal styles
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      maxWidth: '800px',
      maxHeight: '80vh',
      overflow: 'auto',
      width: '90%',
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
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.3s ease'
    },
    
    modalBody: {
      padding: '32px'
    },
    
    contentItem: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px'
    },
    
    contentTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
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
    
    noData: {
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
          <h2 style={styles.loadingTitle}>Loading catalog...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Training Catalog & Project Portfolio</h1>
        <p style={styles.subtitle}>Explore available courses and projects to enhance your team's skills and capabilities</p>
      </div>

      <div style={styles.content}>
        {/* Courses Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <BookOpen size={24} style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>Available Training Courses</h2>
          </div>
          
          {courses.length === 0 ? (
            <div style={styles.noData}>
              <p>No courses available at the moment</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {courses.map((course) => (
                <div
                  key={course._id}
                  style={styles.card}
                  onClick={() => handleCourseClick(course)}
                >
                  {/* Course Header */}
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{course.name}</h3>
                    {course.badgeReward && (
                      <span 
                        style={{
                          ...styles.badge,
                          backgroundColor: getBadgeColor(course.badgeReward)
                        }}
                      >
                        {course.badgeReward}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p style={styles.description}>{course.description}</p>

                  {/* Course Info Grid */}
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <Users size={16} style={styles.infoIcon} />
                      <div style={styles.infoContent}>
                        <div style={styles.infoLabel}>Enrolled</div>
                        <div style={styles.infoValue}>{course.enrolledUsers.length} users</div>
                      </div>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <Calendar size={16} style={styles.infoIcon} />
                      <div style={styles.infoContent}>
                        <div style={styles.infoLabel}>Created</div>
                        <div style={styles.infoValue}>{formatDate(course.createdAt)}</div>
                      </div>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <Target size={16} style={styles.infoIcon} />
                      <div style={styles.infoContent}>
                        <div style={styles.infoLabel}>Difficulty</div>
                        <span 
                          style={{
                            ...styles.difficultyBadge,
                            backgroundColor: getDifficultyColor(course.difficulty)
                          }}
                        >
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <Clock size={16} style={styles.infoIcon} />
                      <div style={styles.infoContent}>
                        <div style={styles.infoLabel}>Duration</div>
                        <div style={styles.infoValue}>{course.eta}</div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Gained */}
                  {course.skillsGained && course.skillsGained.length > 0 && (
                    <div style={styles.skillsContainer}>
                      <div style={styles.skillsTitle}>Skills You'll Gain:</div>
                      <div style={styles.skillsList}>
                        {course.skillsGained.map((skill, index) => (
                          <span key={index} style={{...styles.skillTag, ...styles.skillTagGained}}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button style={styles.viewButton}>
                    <Eye size={16} />
                    View Course Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Award size={24} style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>Available Project Opportunities</h2>
          </div>
          
          {projects.length === 0 ? (
            <div style={styles.noData}>
              <p>No projects available at the moment</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {projects.map((project) => (
                <div key={project._id} style={styles.card}>
                  {/* Project Header */}
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{project.name}</h3>
                    <div style={{display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end'}}>
                      <span 
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: getStatusColor(project.status)
                        }}
                      >
                        {project.status}
                      </span>
                      {project.badgeReward && (
                        <span 
                          style={{
                            ...styles.badge,
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

                  {/* Project Info Grid */}
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
                      <Calendar size={16} style={styles.infoIcon} />
                      <div style={styles.infoContent}>
                        <div style={styles.infoLabel}>
                          {project.status === 'completed' ? 'Completed' : 'Due Date'}
                        </div>
                        <div style={styles.infoValue}>
                          {project.status === 'completed' 
                            ? formatDate(project.completedAt || project.updatedAt)
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
                    
                    <div style={styles.infoItem}>
                      <User size={16} style={styles.infoIcon} />
                      <div style={styles.infoContent}>
                        <div style={styles.infoLabel}>Manager</div>
                        <div style={styles.infoValue}>
                          {project.managedBy ? project.managedBy.name : 'Not assigned'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Required */}
                  {project.skillsRequired && project.skillsRequired.length > 0 && (
                    <div style={styles.skillsContainer}>
                      <div style={styles.skillsTitle}>Skills Required:</div>
                      <div style={styles.skillsList}>
                        {project.skillsRequired.map((skill, index) => (
                          <span key={index} style={{...styles.skillTag, ...styles.skillTagRequired}}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Gained */}
                  {project.skillsGained && project.skillsGained.length > 0 && (
                    <div style={styles.skillsContainer}>
                      <div style={styles.skillsTitle}>Skills You'll Gain:</div>
                      <div style={styles.skillsList}>
                        {project.skillsGained.map((skill, index) => (
                          <span key={index} style={{...styles.skillTag, ...styles.skillTagGained}}>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandedProject(project._id);
                      }}
                    >
                      <span style={styles.usersCount}>
                        Team Members ({project.assignedUsers.length})
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
                          <div style={{textAlign: 'center', color: '#6b7280', fontSize: '14px'}}>
                            No team members assigned yet
                          </div>
                        ) : (
                          project.assignedUsers.map((user) => (
                            <div key={user._id} style={styles.userItem}>
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
          )}
        </div>
      </div>

      {/* Course Details Modal */}
      {showCourseModal && selectedCourse && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedCourse.name}</h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowCourseModal(false)}
              >
                <X size={16} />
                Close
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Course Details */}
              <div style={{marginBottom: '32px'}}>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <BookOpen size={16} style={styles.infoIcon} />
                    <div style={styles.infoContent}>
                      <div style={styles.infoLabel}>Category</div>
                      <div style={styles.infoValue}>{selectedCourse.category}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <Target size={16} style={styles.infoIcon} />
                    <div style={styles.infoContent}>
                      <div style={styles.infoLabel}>Difficulty</div>
                      <span 
                        style={{
                          ...styles.difficultyBadge,
                          backgroundColor: getDifficultyColor(selectedCourse.difficulty)
                        }}
                      >
                        {selectedCourse.difficulty}
                      </span>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <Clock size={16} style={styles.infoIcon} />
                    <div style={styles.infoContent}>
                      <div style={styles.infoLabel}>Duration</div>
                      <div style={styles.infoValue}>{selectedCourse.eta}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <Award size={16} style={styles.infoIcon} />
                    <div style={styles.infoContent}>
                      <div style={styles.infoLabel}>Badge Reward</div>
                      {selectedCourse.badgeReward ? (
                        <span 
                          style={{
                            ...styles.badge,
                            backgroundColor: getBadgeColor(selectedCourse.badgeReward)
                          }}
                        >
                          {selectedCourse.badgeReward}
                        </span>
                      ) : (
                        <div style={styles.infoValue}>None</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prerequisites */}
                {selectedCourse.preRequisites && selectedCourse.preRequisites.length > 0 && (
                  <div style={styles.skillsContainer}>
                    <div style={styles.skillsTitle}>Prerequisites:</div>
                    <ul style={{marginLeft: '20px', color: '#6b7280'}}>
                      {selectedCourse.preRequisites.map((prereq, index) => (
                        <li key={index} style={{marginBottom: '4px'}}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills Gained */}
                {selectedCourse.skillsGained && selectedCourse.skillsGained.length > 0 && (
                  <div style={styles.skillsContainer}>
                    <div style={styles.skillsTitle}>Skills You'll Gain:</div>
                    <div style={styles.skillsList}>
                      {selectedCourse.skillsGained.map((skill, index) => (
                        <span key={index} style={{...styles.skillTag, ...styles.skillTagGained}}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div>
                <h3 style={{color: '#1f2937', marginBottom: '16px', fontSize: '20px', fontWeight: '600'}}>
                  Course Content
                </h3>
                {selectedCourse.content.map((content, index) => (
                  <div key={content._id} style={styles.contentItem}>
                    <h4 style={styles.contentTitle}>
                      Module {index + 1}: {content.title}
                    </h4>
                    <p style={{color: '#6b7280', marginBottom: '16px', lineHeight: '1.6'}}>
                      {content.description}
                    </p>
                    
                    {content.videoUrl && content.videoUrl.length > 0 && (
                      <div style={{marginBottom: '12px'}}>
                        <strong style={{color: '#374151', fontSize: '14px'}}>Video Resources:</strong>
                        <ul style={{marginLeft: '20px', marginTop: '8px'}}>
                          {content.videoUrl.map((url, urlIndex) => (
                            <li key={urlIndex} style={{marginBottom: '4px'}}>
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  color: '#667eea',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  fontSize: '14px'
                                }}
                              >
                                <Play size={14} />
                                Video {urlIndex + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {content.resourceLink && content.resourceLink.length > 0 && (
                      <div>
                        <strong style={{color: '#374151', fontSize: '14px'}}>Additional Resources:</strong>
                        <ul style={{marginLeft: '20px', marginTop: '8px'}}>
                          {content.resourceLink.map((link, linkIndex) => (
                            <li key={linkIndex} style={{marginBottom: '4px'}}>
                              <a 
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  color: '#667eea',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  fontSize: '14px'
                                }}
                              >
                                <ExternalLink size={14} />
                                Resource {linkIndex + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
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

export default Catalog;
