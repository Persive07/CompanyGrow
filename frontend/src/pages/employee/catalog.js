import React, { useState, useEffect } from 'react';
import makeAuthenticatedRequest from '../../utils/api';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Award, 
  Eye, 
  X, 
  Play, 
  ExternalLink, 
  Clock, 
  Target,
  Search,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import CatalogProjects from './catalogProjects';

const Catalog = () => {
  const [courses, setCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [completingModule, setCompletingModule] = useState(null);
  
  // Filter and sort states
  const [nameFilter, setNameFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Get user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem('id');
  };

  // Fetch courses and user data
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

        // Fetch courses
        const coursesResponse = await makeAuthenticatedRequest('/api/course/getAllCourses');

        // Fetch user data
        const userResponse = await makeAuthenticatedRequest(`/api/user/getProfile/${userId}`);

        if (coursesResponse.ok && userResponse.ok) {
          const coursesData = await coursesResponse.json();
          const userData = await userResponse.json();
          
          setCourses(coursesData);
          setUserData(userData);
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

  // Check enrollment status for a course
  const getEnrollmentStatus = (courseName) => {
    if (!userData || !userData.performanceMetrics) return null;

    for (const metric of userData.performanceMetrics) {
      if (metric.goals) {
        const goal = metric.goals.find(
          g => g.title === courseName && g.mode === 'Training'
        );
        if (goal) {
          return goal.status;
        }
      }
    }
    return null;
  };

  // Handle course enrollment
  const handleEnrollCourse = async (courseId) => {
    setEnrolling(true);
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();

      const response = await makeAuthenticatedRequest(`/api/course/enrollCourse/${userId}/${courseId}`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Successfully enrolled in the course!');
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Enrollment failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Error enrolling in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  // Handle module completion
  const handleCompleteModule = async (courseId, contentId) => {
    setCompletingModule(contentId);
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();

      const response = await makeAuthenticatedRequest(`/api/course/completeModule/${userId}/${courseId}/${contentId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Module completed! Progress: ${result.progress}%`);
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

  // Check if user has completed a specific module
  const isModuleCompleted = (courseId, contentId) => {
    if (!selectedCourse || !selectedCourse.enrolledUsers) return false;
    
    const userId = getUserId();
    const userProgress = selectedCourse.enrolledUsers.find(
      user => user.userId === userId
    );
    
    return userProgress && userProgress.completedModules.includes(contentId);
  };

  // Filter and sort courses
  const getFilteredAndSortedCourses = () => {
    let filtered = courses.filter(course => {
      const nameMatch = course.name.toLowerCase().includes(nameFilter.toLowerCase());
      const skillsMatch = skillsFilter === '' || 
        course.skillsGained.some(skill => 
          skill.toLowerCase().includes(skillsFilter.toLowerCase())
        );
      return nameMatch && skillsMatch;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (sortBy === 'enrolledCount') {
        aValue = a.enrolledUsers.length;
        bValue = b.enrolledUsers.length;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': '#10b981',
      'Intermediate': '#f59e0b',
      'Advanced': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  };

  // Get enrollment button text and style
  const getEnrollmentButton = (course) => {
    const status = getEnrollmentStatus(course.name);
    
    if (!status) {
      return {
        text: 'Enroll',
        style: styles.enrollButton,
        onClick: () => handleEnrollCourse(course._id),
        disabled: enrolling
      };
    }

    switch (status) {
      case 'in-progress':
        return {
          text: 'In Progress',
          style: styles.inProgressButton,
          onClick: null,
          disabled: true
        };
      case 'completed':
        return {
          text: 'Completed',
          style: styles.completedButton,
          onClick: null,
          disabled: true
        };
      default:
        return {
          text: 'Enroll',
          style: styles.enrollButton,
          onClick: () => handleEnrollCourse(course._id),
          disabled: enrolling
        };
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
    
    filtersSection: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      marginBottom: '32px'
    },
    
    filtersHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: '2px solid #e5e7eb'
    },
    
    filtersTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    
    filtersIcon: {
      color: '#667eea'
    },
    
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'
    },
    
    filterGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    
    filterLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    
    filterInput: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.3s ease',
      backgroundColor: 'white'
    },
    
    filterSelect: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      color: '#1f2937'
    },
    
    coursesSection: {
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
    
    coursesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px'
    },
    
    courseCard: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    
    courseCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    },
    
    courseHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    
    courseName: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0,
      flex: 1
    },
    
    badgeReward: {
      padding: '6px 12px',
      borderRadius: '16px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600'
    },
    
    courseDescription: {
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
      backgroundColor: '#10b981',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600'
    },
    
    enrollButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'background-color 0.3s ease'
    },
    
    inProgressButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#f59e0b',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'not-allowed',
      fontSize: '14px',
      fontWeight: '600'
    },
    
    completedButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'not-allowed',
      fontSize: '14px',
      fontWeight: '600'
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
    
    detailSection: {
      marginBottom: '24px'
    },
    
    detailTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '12px'
    },
    
    contentList: {
      marginTop: '16px'
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
      fontSize: '16px',
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
    
    noResults: {
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
          <h2 style={styles.loadingTitle}>Loading courses...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Training Catalog & Resources</h1>
        <p style={styles.subtitle}>Explore available courses and learning opportunities to enhance your skills</p>
      </div>

      <div style={styles.content}>
        {/* Filters Section */}
        <div style={styles.filtersSection}>
          <div style={styles.filtersHeader}>
            <Filter size={20} style={styles.filtersIcon} />
            <h2 style={styles.filtersTitle}>Search & Filter Courses</h2>
          </div>
          
          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search by Course Name:</label>
              <input
                type="text"
                style={styles.filterInput}
                placeholder="Enter course name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Filter by Skills:</label>
              <input
                type="text"
                style={styles.filterInput}
                placeholder="Enter skill..."
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
              />
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort by:</label>
              <select
                style={styles.filterSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Date Created</option>
                <option value="enrolledCount">Enrolled Users</option>
              </select>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Order:</label>
              <select
                style={styles.filterSelect}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div style={styles.coursesSection}>
          <div style={styles.sectionHeader}>
            <BookOpen size={24} style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>Available Training Courses</h2>
          </div>
          
          {getFilteredAndSortedCourses().length === 0 ? (
            <div style={styles.noResults}>
              <h3>No courses found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div style={styles.coursesGrid}>
              {getFilteredAndSortedCourses().map((course) => {
                const enrollmentButton = getEnrollmentButton(course);
                
                return (
                  <div
                    key={course._id}
                    style={styles.courseCard}
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowCourseDetails(true);
                    }}
                  >
                    {/* Course Header */}
                    <div style={styles.courseHeader}>
                      <h3 style={styles.courseName}>{course.name}</h3>
                      {course.badgeReward && (
                        <span 
                          style={{
                            ...styles.badgeReward,
                            backgroundColor: getBadgeColor(course.badgeReward)
                          }}
                        >
                          {course.badgeReward}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p style={styles.courseDescription}>{course.description}</p>

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
                            <span key={index} style={styles.skillTag}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enrollment Button */}
                    <button
                      style={enrollmentButton.style}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (enrollmentButton.onClick) {
                          enrollmentButton.onClick();
                        }
                      }}
                      disabled={enrollmentButton.disabled}
                    >
                      {enrollmentButton.text === 'Enroll' && <BookOpen size={16} />}
                      {enrollmentButton.text === 'In Progress' && <Clock size={16} />}
                      {enrollmentButton.text === 'Completed' && <CheckCircle size={16} />}
                      {enrollmentButton.text}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects Section */}
        <CatalogProjects />
      </div>

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedCourse.name}</h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowCourseDetails(false)}
              >
                <X size={16} />
                Close
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailSection}>
                <h3 style={styles.detailTitle}>Description</h3>
                <p>{selectedCourse.description}</p>
              </div>

              <div style={styles.detailSection}>
                <h3 style={styles.detailTitle}>Course Information</h3>
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
                            ...styles.badgeReward,
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
              </div>

              {selectedCourse.preRequisites && selectedCourse.preRequisites.length > 0 && (
                <div style={styles.detailSection}>
                  <h3 style={styles.detailTitle}>Prerequisites</h3>
                  <ul style={{marginLeft: '20px', color: '#6b7280'}}>
                    {selectedCourse.preRequisites.map((prereq, index) => (
                      <li key={index} style={{marginBottom: '4px'}}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCourse.skillsGained && selectedCourse.skillsGained.length > 0 && (
                <div style={styles.detailSection}>
                  <h3 style={styles.detailTitle}>Skills You'll Gain</h3>
                  <div style={styles.skillsList}>
                    {selectedCourse.skillsGained.map((skill, index) => (
                      <span key={index} style={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.detailSection}>
                <h3 style={styles.detailTitle}>Course Content</h3>
                <div style={styles.contentList}>
                  {selectedCourse.content.map((content, index) => {
                    const isCompleted = isModuleCompleted(selectedCourse._id, content._id);
                    const isEnrolled = getEnrollmentStatus(selectedCourse.name);
                    
                    return (
                      <div key={content._id} style={styles.contentItem}>
                        <div style={styles.contentHeader}>
                          <h4 style={styles.contentTitle}>
                            Module {index + 1}: {content.title}
                          </h4>
                          {isEnrolled && (
                            <button
                              style={isCompleted ? styles.moduleCompletedButton : styles.moduleButton}
                              onClick={(e) => {
                                e.stopPropagation();
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
                          )}
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
