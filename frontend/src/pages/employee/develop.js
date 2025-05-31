import React, { useState, useEffect } from 'react';
import makeAuthenticatedRequest from '../../utils/api';
import { 
  TrendingUp, 
  BookOpen, 
  Award, 
  Calendar, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  X,
  Play,
  ExternalLink,
  Users,
  Star
} from 'lucide-react';

const Develop = () => {
  const [userData, setUserData] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);
  const [completingModule, setCompletingModule] = useState(null);

  // Get user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem('id');
  };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = getUserId();

        if (!token || !userId) {
          console.error('No token or user ID found');
          setLoading(false);
          return;
        }

        // Fetch user profile
        const userResponse = await makeAuthenticatedRequest(`/api/user/getProfile/${userId}`);

        // Fetch all courses
        const coursesResponse = await makeAuthenticatedRequest('/api/course/getAllCourses');

        // Fetch all projects
        const projectsResponse = await makeAuthenticatedRequest('/api/project/getAllProjects');

        if (userResponse.ok && coursesResponse.ok && projectsResponse.ok) {
          const userData = await userResponse.json();
          const coursesData = await coursesResponse.json();
          const projectsData = await projectsResponse.json();

          setUserData(userData);
          setAllCourses(coursesData);
          setAllProjects(projectsData.projects || []);

          // Extract user's enrolled courses and projects from performance metrics
          extractUserActivities(userData, coursesData, projectsData.projects || []);
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

  // Extract user's courses and projects from performance metrics
  const extractUserActivities = (userData, allCourses, allProjects) => {
    const userCourses = [];
    const userProjects = [];

    if (userData.performanceMetrics) {
      userData.performanceMetrics.forEach(metric => {
        if (metric.goals) {
          metric.goals.forEach(goal => {
            if (goal.mode === 'Training') {
              const course = allCourses.find(c => c.name === goal.title);
              if (course) {
                const enrolledUser = course.enrolledUsers.find(u => u.userId === userData._id);
                userCourses.push({
                  ...course,
                  goalStatus: goal.status,
                  enrolledAt: enrolledUser?.enrolledAt,
                  completedAt: goal.completedAt || enrolledUser?.completedAt,
                  progress: enrolledUser?.progress || 0,
                  completedModules: enrolledUser?.completedModules || []
                });
              }
            } else if (goal.mode === 'Project') {
              const project = allProjects.find(p => p.name === goal.title);
              if (project) {
                userProjects.push({
                  ...project,
                  goalStatus: goal.status,
                  completedAt: goal.completedAt
                });
              }
            }
          });
        }
      });
    }

    setUserCourses(userCourses);
    setUserProjects(userProjects);
  };

  // Handle course click to show details
  const handleCourseClick = async (course) => {
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();

      const response = await makeAuthenticatedRequest(`/api/user/getCourseStatus/${userId}/${course._id}`);

      if (response.ok) {
        const details = await response.json();
        setSelectedCourse(course);
        setCourseDetails(details);
        setShowCourseModal(true);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  // Handle module completion
  const handleCompleteModule = async (courseId, contentId) => {
    setCompletingModule(contentId);
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();

      const response = await makeAuthenticatedRequest(`/api/course/completeModule/${userId}/${courseId}/${contentId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Module completed! Progress: ${result.progress}%`);
        // Refresh course details
        handleCourseClick(selectedCourse);
        // Refresh main data
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error completing module:', error);
      alert('Error completing module. Please try again.');
    } finally {
      setCompletingModule(null);
    }
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
      'in-progress': '#f59e0b',
      'on-hold': '#ef4444',
      'completed': '#10b981',
      'pending': '#6b7280'
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

  // Group activities by status
  const getGroupedActivities = () => {
    const inProgress = [];
    const onHold = [];
    const completed = [];

    // Add courses
    userCourses.forEach(course => {
      const activity = { ...course, type: 'course' };
      if (course.goalStatus === 'in-progress') {
        inProgress.push(activity);
      } else if (course.goalStatus === 'on-hold') {
        onHold.push(activity);
      } else if (course.goalStatus === 'completed') {
        completed.push(activity);
      }
    });

    // Add projects
    userProjects.forEach(project => {
      const activity = { ...project, type: 'project' };
      if (project.goalStatus === 'in-progress') {
        inProgress.push(activity);
      } else if (project.goalStatus === 'on-hold' || project.status === 'on-hold') {
        onHold.push(activity);
      } else if (project.goalStatus === 'completed' || project.status === 'completed') {
        completed.push(activity);
      }
    });

    return { inProgress, onHold, completed };
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (userCourses.length === 0) return 0;
    
    const totalProgress = userCourses.reduce((sum, course) => {
      return sum + (course.progress || 0);
    }, 0);
    
    return Math.round(totalProgress / userCourses.length);
  };

  // Get completed courses count
  const getCompletedCoursesCount = () => {
    return userCourses.filter(course => course.progress === 100).length;
  };

  // Get badges earned count
  const getBadgesEarnedCount = () => {
    if (!userData || !userData.performanceMetrics) return 0;
    
    let badgesCount = 0;
    userData.performanceMetrics.forEach(metric => {
      if (metric.badgesEarned) {
        badgesCount += metric.badgesEarned.length;
      }
    });
    
    return badgesCount;
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
    
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    
    statCard: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      textAlign: 'center',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    
    statIcon: {
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
    
    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px'
    },
    
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500'
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
    
    activitiesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px'
    },
    
    activityCard: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    
    activityCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    },
    
    activityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    
    activityType: {
      backgroundColor: '#667eea',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    
    activityTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      margin: '12px 0 16px 0'
    },
    
    activityDescription: {
      color: '#6b7280',
      marginBottom: '20px',
      lineHeight: '1.6',
      fontSize: '14px'
    },
    
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '16px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    
    progressContainer: {
      marginBottom: '20px'
    },
    
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    
    progressLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    
    progressValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#667eea'
    },
    
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    
    progressFill: {
      height: '100%',
      backgroundColor: '#667eea',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
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
    
    badgeReward: {
      padding: '6px 12px',
      borderRadius: '16px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600'
    },
    
    priorityBadge: {
      padding: '4px 8px',
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
    
    contentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    
    contentTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937'
    },
    
    moduleButton: {
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    
    moduleCompletedButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'not-allowed',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
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
    
    noActivities: {
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
          <h2 style={styles.loadingTitle}>Loading your development activities...</h2>
        </div>
      </div>
    );
  }

  const { inProgress, onHold, completed } = getGroupedActivities();

  const renderActivity = (activity) => (
    <div
      key={`${activity.type}-${activity._id}`}
      style={styles.activityCard}
      onClick={() => activity.type === 'course' ? handleCourseClick(activity) : null}
    >
      {/* Activity Header */}
      <div style={styles.activityHeader}>
        <span style={styles.activityType}>{activity.type}</span>
        <span 
          style={{
            ...styles.statusBadge,
            backgroundColor: getStatusColor(activity.goalStatus || activity.status)
          }}
        >
          {activity.goalStatus || activity.status}
        </span>
      </div>

      {/* Title and Description */}
      <h3 style={styles.activityTitle}>{activity.name}</h3>
      <p style={styles.activityDescription}>{activity.description}</p>

      {/* Progress Bar for Courses */}
      {activity.type === 'course' && (
        <div style={styles.progressContainer}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Progress</span>
            <span style={styles.progressValue}>{activity.progress || 0}%</span>
          </div>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${activity.progress || 0}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div style={styles.infoGrid}>
        {activity.type === 'course' ? (
          <>
            <div style={styles.infoItem}>
              <Target size={16} style={styles.infoIcon} />
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Difficulty</div>
                <div style={styles.infoValue}>{activity.difficulty}</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <Calendar size={16} style={styles.infoIcon} />
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Enrolled</div>
                <div style={styles.infoValue}>{formatDate(activity.enrolledAt)}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={styles.infoItem}>
              <AlertCircle size={16} style={styles.infoIcon} />
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Priority</div>
                <span style={{
                  ...styles.priorityBadge,
                  backgroundColor: getPriorityColor(activity.priority)
                }}>
                  {activity.priority}
                </span>
              </div>
            </div>
            <div style={styles.infoItem}>
              <Calendar size={16} style={styles.infoIcon} />
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Created</div>
                <div style={styles.infoValue}>{formatDate(activity.createdAt)}</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <Star size={16} style={styles.infoIcon} />
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Manager</div>
                <div style={styles.infoValue}>
                  {activity.managedBy ? activity.managedBy.name : 'Not assigned'}
                </div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <Calendar size={16} style={styles.infoIcon} />
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>
                  {activity.goalStatus === 'completed' ? 'Completed' : 'Due Date'}
                </div>
                <div style={styles.infoValue}>
                  {activity.goalStatus === 'completed' 
                    ? formatDate(activity.completedAt)
                    : formatDate(activity.deadline)
                  }
                </div>
              </div>
            </div>
          </>
        )}

        {/* Badge Reward */}
        <div style={styles.infoItem}>
          <Award size={16} style={styles.infoIcon} />
          <div style={styles.infoContent}>
            <div style={styles.infoLabel}>Badge Reward</div>
            {activity.badgeReward ? (
              <span 
                style={{
                  ...styles.badgeReward,
                  backgroundColor: getBadgeColor(activity.badgeReward)
                }}
              >
                {activity.badgeReward}
              </span>
            ) : (
              <div style={styles.infoValue}>None</div>
            )}
          </div>
        </div>
      </div>

      {/* Assigned Users for Projects */}
      {activity.type === 'project' && (
        <div style={styles.usersSection}>
          <div 
            style={styles.usersHeader}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpandedProject(activity._id);
            }}
          >
            <span style={styles.usersCount}>
              Team Members ({activity.assignedUsers.length})
            </span>
            <span 
              style={{
                ...styles.expandArrow,
                ...(expandedProject === activity._id ? styles.expandArrowRotated : {})
              }}
            >
              ▶
            </span>
          </div>

          {expandedProject === activity._id && (
            <div style={styles.usersList}>
              {activity.assignedUsers.length === 0 ? (
                <div style={{textAlign: 'center', color: '#6b7280', fontSize: '14px'}}>
                  No team members assigned
                </div>
              ) : (
                activity.assignedUsers.map((user) => (
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
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Personal Development & Growth</h1>
        <p style={styles.subtitle}>Track your learning journey and skill advancement</p>
      </div>

      <div style={styles.content}>
        {/* Progress Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <TrendingUp size={24} />
            </div>
            <div style={styles.statValue}>{calculateOverallProgress()}%</div>
            <div style={styles.statLabel}>Overall Progress</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <BookOpen size={24} />
            </div>
            <div style={styles.statValue}>{userCourses.length}</div>
            <div style={styles.statLabel}>Enrolled Courses</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <CheckCircle size={24} />
            </div>
            <div style={styles.statValue}>{getCompletedCoursesCount()}</div>
            <div style={styles.statLabel}>Completed Courses</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <Award size={24} />
            </div>
            <div style={styles.statValue}>{getBadgesEarnedCount()}</div>
            <div style={styles.statLabel}>Badges Earned</div>
          </div>
        </div>

        {/* In Progress Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Clock size={24} style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>In Progress Activities</h2>
          </div>
          {inProgress.length === 0 ? (
            <div style={styles.noActivities}>
              <p>No activities in progress</p>
            </div>
          ) : (
            <div style={styles.activitiesGrid}>
              {inProgress.map(renderActivity)}
            </div>
          )}
        </div>

        {/* On Hold Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <AlertCircle size={24} style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>On Hold Activities</h2>
          </div>
          {onHold.length === 0 ? (
            <div style={styles.noActivities}>
              <p>No activities on hold</p>
            </div>
          ) : (
            <div style={styles.activitiesGrid}>
              {onHold.map(renderActivity)}
            </div>
          )}
        </div>

        {/* Completed Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <CheckCircle size={24} style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>Completed Activities</h2>
          </div>
          {completed.length === 0 ? (
            <div style={styles.noActivities}>
              <p>No completed activities</p>
            </div>
          ) : (
            <div style={styles.activitiesGrid}>
              {completed.map(renderActivity)}
            </div>
          )}
        </div>
      </div>

      {/* Course Details Modal */}
      {showCourseModal && selectedCourse && courseDetails && (
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
              {/* Progress Bar */}
              <div style={styles.progressContainer}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>Overall Progress</span>
                  <span style={styles.progressValue}>{courseDetails.progress || 0}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${courseDetails.progress || 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Course Content */}
              <div>
                <h3 style={{color: '#1f2937', marginBottom: '16px', fontSize: '20px', fontWeight: '600'}}>
                  Course Modules
                </h3>
                {courseDetails.courseContent?.map((content, index) => {
                  const isCompleted = courseDetails.completedModules.includes(content._id);
                  
                  return (
                    <div key={content._id} style={styles.contentItem}>
                      <div style={styles.contentHeader}>
                        <h4 style={styles.contentTitle}>
                          Module {index + 1}: {content.title}
                        </h4>
                        <button
                          style={isCompleted ? styles.moduleCompletedButton : styles.moduleButton}
                          onClick={() => {
                            if (!isCompleted) {
                              handleCompleteModule(selectedCourse._id, content._id);
                            }
                          }}
                          disabled={isCompleted || completingModule === content._id}
                        >
                          {completingModule === content._id ? (
                            <>
                              <Clock size={16} />
                              Completing...
                            </>
                          ) : isCompleted ? (
                            <>
                              <CheckCircle size={16} />
                              Completed
                            </>
                          ) : (
                            <>
                              <Play size={16} />
                              Complete Module
                            </>
                          )}
                        </button>
                      </div>
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
                  );
                })}
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

export default Develop;
