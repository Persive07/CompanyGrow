import React, { useState, useEffect } from 'react';
import makeAuthenticatedRequest from '../../utils/api';
import { 
  Plus, 
  Clock, 
  Users, 
  Calendar, 
  ArrowLeft, 
  Edit, 
  Play, 
  FileText,
  Link,
  Save,
  X,
  Award,
} from 'lucide-react';

const AdminCoursesTab = () => {
  const [view, setView] = useState('list'); // 'list', 'detail', 'add', 'edit'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    preRequisites: '',
    skillsGained: '',
    eta: '',
    badgeReward: '',
    content: []
  });

  // Fetch courses from database
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('/api/course/getAllCourses');

      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Get random color for course card
  const getRandomColor = (courseName) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
    ];
    const index = courseName.length % colors.length;
    return colors[index];
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle form submission for new course
  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const courseData = {
        ...newCourse,
        preRequisites: newCourse.preRequisites.split(',').map(item => item.trim()).filter(item => item),
        skillsGained: newCourse.skillsGained.split(',').map(item => item.trim()).filter(item => item)
      };

      const response = await makeAuthenticatedRequest('/api/course/addCourse',{
        method: 'POST',
        body: JSON.stringify(courseData)
      });

      if (!response.ok) throw new Error('Failed to create course');
      
      await fetchCourses(); // Refresh the course list
      setView('list');
      setNewCourse({
        name: '',
        description: '',
        category: '',
        difficulty: 'Beginner',
        preRequisites: '',
        skillsGained: '',
        eta: '',
        badgeReward: '',
        content: []
      });
    } catch (err) {
      setError('Failed to create course: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add content module to course
  const addContentModule = () => {
    setNewCourse(prev => ({
      ...prev,
      content: [...prev.content, {
        title: '',
        description: '',
        videoUrl: [],
        resourceLink: []
      }]
    }));
  };

  // Update content module
  const updateContentModule = (index, field, value) => {
    setNewCourse(prev => ({
      ...prev,
      content: prev.content.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Remove content module
  const removeContentModule = (index) => {
    setNewCourse(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  // Add this state for editing
    const [editCourse, setEditCourse] = useState({
    _id: '',
    name: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    preRequisites: '',
    skillsGained: '',
    eta: '',
    badgeReward: '',
    content: []
    });

    // Function to handle edit button click
    const handleEditCourse = (course) => {
    setEditCourse({
        _id: course._id,
        name: course.name,
        description: course.description || '',
        category: course.category || '',
        difficulty: course.difficulty || 'Beginner',
        preRequisites: course.preRequisites ? course.preRequisites.join(', ') : '',
        skillsGained: course.skillsGained ? course.skillsGained.join(', ') : '',
        eta: course.eta || '',
        badgeReward: course.badgeReward || 'Green',
        content: course.content || []
    });
    setView('edit');
    };

    // Function to handle course update
    const handleUpdateCourse = async () => {
        setLoading(true);
        try {
            const courseData = {
            ...editCourse,
            preRequisites: editCourse.preRequisites.split(',').map(item => item.trim()).filter(item => item),
            skillsGained: editCourse.skillsGained.split(',').map(item => item.trim()).filter(item => item)
            };

            const response = await makeAuthenticatedRequest(`/api/course/modifyCourse/${editCourse._id}`,{
              method: 'POST',
              body: JSON.stringify(courseData)
            });



            if (!response.ok) throw new Error('Failed to update course');
            
            // Refresh the course list
            await fetchCourses();
            
            // Go back to main courses list
            setView('list');
            setSelectedCourse(null);
            
            // Clear any errors
            setError('');
            
        } catch (err) {
            setError('Failed to update course: ' + err.message);
        } finally {
            setLoading(false);
        }
        };

    // Functions for editing content modules
    const addEditContentModule = () => {
    setEditCourse(prev => ({
        ...prev,
        content: [...prev.content, {
        title: '',
        description: '',
        videoUrl: [],
        resourceLink: []
        }]
    }));
    };

    const updateEditContentModule = (index, field, value) => {
    setEditCourse(prev => ({
        ...prev,
        content: prev.content.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
        )
    }));
    };

    const removeEditContentModule = (index) => {
    setEditCourse(prev => ({
        ...prev,
        content: prev.content.filter((_, i) => i !== index)
    }));
    };

    const getBadgeColor = (badge) => {
      switch (badge) {
        case 'Green':
          return '#28a745';
        case 'Cyan':
          return '#00bcd4 ';
        case 'Blue':
          return '#003f7f';
        case 'Purple':
          return '#6f42c1';
        case 'Red':
          return '#dc3545';
      }
    };
    


  
  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    addButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500'
    },
    backButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      marginBottom: '20px'
    },
    coursesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    courseCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      border: '1px solid #e0e0e0'
    },
    courseCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
    },
    courseIcon: {
      width: '100%',
      height: '120px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '15px',
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white'
    },
    courseName: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333'
    },
    courseDescription: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '15px',
      lineHeight: '1.4'
    },
    courseStats: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      color: '#888'
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    form: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '0 auto'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    contentSection: {
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: '#f9f9f9'
    },
    contentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    removeButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    addContentButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      marginBottom: '20px'
    },
    submitButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '12px 30px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '16px',
      color: '#666'
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid #f5c6cb'
    },
    courseDetail: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    courseDetailHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px'
    },
    editButton: {
      backgroundColor: '#17a2b8',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px'
    },
    badge: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      display: 'inline-block',
      margin: '0 4px 4px 0'
    },
    contentModule: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '15px'
    },
    moduleTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333'
    },
    moduleDescription: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '15px',
      lineHeight: '1.5'
    },
    linksList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    linkItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
      fontSize: '14px'
    },
    link: {
      color: '#007bff',
      textDecoration: 'none'
    }
  };

  
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading courses...</div>
      </div>
    );
  }
  
  if (view === 'list') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Course Management</h1>
          <button 
            style={styles.addButton}
            onClick={() => setView('add')}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            <Plus size={16} />
            Add New Course
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.coursesGrid}>
          {courses.map(course => (
            <div
              key={course._id}
              style={styles.courseCard}
              onClick={() => {
                setSelectedCourse(course);
                setView('detail');
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
            >
              <div 
                style={{
                  ...styles.courseIcon,
                  backgroundColor: getRandomColor(course.name)
                }}
              >
                {course.name}
              </div>
              <h3 style={styles.courseName}>{course.name}</h3>
              <p style={styles.courseDescription}>
                {course.description?.substring(0, 120)}...
              </p>
              <div style={styles.courseStats}>
                <div style={styles.statItem}>
                  <Clock size={14} />
                  {course.eta}
                </div>
                <div style={styles.statItem}>
                  <Users size={14} />
                  {course.enrolledUsers?.length || 0} enrolled
                </div>
                <div style={styles.statItem}>
                  <Calendar size={14} />
                  {formatDate(course.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Detailed View
  if (view === 'detail' && selectedCourse) {
    return (
      <div style={styles.container}>
        <button 
          style={styles.backButton}
          onClick={() => setView('list')}
          onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
        >
          <ArrowLeft size={16} />
          Back to Courses
        </button>

        <div style={styles.courseDetail}>
          <div style={styles.courseDetailHeader}>
            <div>
              <h1 style={{ fontSize: '28px', marginBottom: '10px', color: '#333' }}>
                {selectedCourse.name}
              </h1>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
                {selectedCourse.description}
              </p>
              <div style={{ marginBottom: '20px' }}>
                <strong>Category:</strong> {selectedCourse.category} | 
                <strong> Difficulty:</strong> {selectedCourse.difficulty} | 
                <strong> ETA:</strong> {selectedCourse.eta}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <strong>Prerequisites:</strong>
                {selectedCourse.preRequisites?.map(skill => (
                  <span key={skill} style={styles.badge}>{skill}</span>
                ))}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <strong>Skills Gained:</strong>

                {selectedCourse.skillsGained?.map(skill => (
                  <span key={skill} style={styles.badge}>{skill}</span>
                ))}
              </div>


              {selectedCourse.badgeReward && (
                <div style={{ marginBottom: '20px' }}>
                  <strong>Badge Reward:</strong> 
                  <span style={{...styles.badge, backgroundColor: getBadgeColor(selectedCourse.badgeReward)}}>
                    <Award size={12} style={{marginRight: '4px'}} />
                    {selectedCourse.badgeReward}
                  </span>
                </div>
              )}




            </div>
                <button 
                    style={styles.editButton}
                    onClick={() => handleEditCourse(selectedCourse)}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#138496'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#17a2b8'}
                    >
                    <Edit size={16} />
                    Modify Course
                </button>
          </div>

          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '20px', color: '#333' }}>
              Course Content
            </h2>
            {selectedCourse.content?.map((module, index) => (
              <div key={module._id || index} style={styles.contentModule}>
                <h3 style={styles.moduleTitle}>{module.title}</h3>
                <p style={styles.moduleDescription}>{module.description}</p>
                
                {module.videoUrl?.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'block', marginBottom: '8px' }}>
                      <Play size={16} style={{marginRight: '6px', verticalAlign: 'middle'}} />
                      Videos:
                    </strong>
                    <ul style={styles.linksList}>
                      {module.videoUrl.map((url, i) => (
                        <li key={i} style={styles.linkItem}>
                          <Play size={14} />
                          <a href={url} style={styles.link} target="_blank" rel="noopener noreferrer">
                            Video {i + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {module.resourceLink?.length > 0 && (
                  <div>
                    <strong style={{ display: 'block', marginBottom: '8px' }}>
                      <FileText size={16} style={{marginRight: '6px', verticalAlign: 'middle'}} />
                      Resources:
                    </strong>
                    <ul style={styles.linksList}>
                      {module.resourceLink.map((url, i) => (
                        <li key={i} style={styles.linkItem}>
                          <Link size={14} />
                          <a href={url} style={styles.link} target="_blank" rel="noopener noreferrer">
                            Resource {i + 1}
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
    );
  }

  // Add Course Form View
  if (view === 'add') {
    return (
      <div style={styles.container}>
        <button 
          style={styles.backButton}
          onClick={() => setView('list')}
          onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
        >
          <ArrowLeft size={16} />
          Back to Courses
        </button>

        <div style={styles.form}>
          <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#333' }}>
            Add New Course
          </h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmitCourse}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Course Name *</label>
              <input
                type="text"
                style={styles.input}
                value={newCourse.name}
                onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                placeholder="Brief description of the course"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                  placeholder="e.g., Programming, Database"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Difficulty</label>
                <select
                  style={styles.select}
                  value={newCourse.difficulty}
                  onChange={(e) => setNewCourse({...newCourse, difficulty: e.target.value})}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Prerequisites (comma-separated)</label>
              <input
                type="text"
                style={styles.input}
                value={newCourse.preRequisites}
                onChange={(e) => setNewCourse({...newCourse, preRequisites: e.target.value})}
                placeholder="e.g., JavaScript, HTML, CSS"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Skills Gained (comma-separated)</label>
              <input
                type="text"
                style={styles.input}
                value={newCourse.skillsGained}
                onChange={(e) => setNewCourse({...newCourse, skillsGained: e.target.value})}
                placeholder="e.g., React, Node.js, MongoDB"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Estimated Time</label>
                <input
                  type="text"
                  style={styles.input}
                  value={newCourse.eta}
                  onChange={(e) => setNewCourse({...newCourse, eta: e.target.value})}
                  placeholder="e.g., 4 weeks, 40 hours"
                />
              </div>





              <div style={styles.formGroup}>
                <label style={styles.label}>Badge Reward</label>
                <select
                  style={{
                    ...styles.input,
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: getBadgeColor(newCourse.badgeReward || 'Green'),
                    border: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    cursor: 'pointer',
                    textAlignLast: 'center'
                  }}
                  value={newCourse.badgeReward || 'Green'}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, badgeReward: e.target.value })
                  }
                >
                  {['Green', 'Cyan', 'Blue', 'Purple', 'Red'].map((badge) => (
                    <option
                      key={badge}
                      value={badge}
                      style={{
                        backgroundColor: getBadgeColor(badge),
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                    >
                      {badge}
                    </option>
                  ))}
                </select>
              </div>













            </div>
            <h3 style={{ fontSize: '20px', margin: '30px 0 20px 0', color: '#333' }}>
              Course Content
            </h3>

            <button
              type="button"
              style={styles.addContentButton}
              onClick={addContentModule}
              onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              <Plus size={16} />
              Add Content Module
            </button>

            {newCourse.content.map((module, index) => (
              <div key={index} style={styles.contentSection}>
                <div style={styles.contentHeader}>
                  <h4 style={{ margin: 0, color: '#333' }}>Module {index + 1}</h4>
                  <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => removeContentModule(index)}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Module Title</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={module.title}
                    onChange={(e) => updateContentModule(index, 'title', e.target.value)}
                    placeholder="e.g., Week 1: Introduction"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Module Description</label>
                  <textarea
                    style={styles.textarea}
                    value={module.description}
                    onChange={(e) => updateContentModule(index, 'description', e.target.value)}
                    placeholder="Detailed description of this module"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Video URLs (one per line)</label>
                  <textarea
                    style={styles.textarea}
                    value={module.videoUrl.join('\n')}
                    onChange={(e) => updateContentModule(index, 'videoUrl', e.target.value.split('\n').filter(url => url.trim()))}
                    placeholder="https://example.com/video1&#10;https://example.com/video2"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Resource Links (one per line)</label>
                  <textarea
                    style={styles.textarea}
                    value={module.resourceLink.join('\n')}
                    onChange={(e) => updateContentModule(index, 'resourceLink', e.target.value.split('\n').filter(url => url.trim()))}
                    placeholder="https://example.com/resource1&#10;https://example.com/resource2"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              style={styles.submitButton}
              disabled={loading}
              onClick={handleSubmitCourse}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#0056b3')}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#007bff')}
            >
              <Save size={16} style={{marginRight: '8px'}} />
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'edit') {
    return (
        <div style={styles.container}>
        <button 
            style={styles.backButton}
            onClick={() => setView('detail')}
            onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
        >
            <ArrowLeft size={16} />
            Back to Course Details
        </button>

        <div style={styles.form}>
            <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#333' }}>
            Edit Course: {editCourse.name}
            </h2>

            {error && <div style={styles.error}>{error}</div>}

            <div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Course Name *</label>
                <input
                type="text"
                style={styles.input}
                value={editCourse.name}
                onChange={(e) => setEditCourse({...editCourse, name: e.target.value})}
                required
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                style={styles.textarea}
                value={editCourse.description}
                onChange={(e) => setEditCourse({...editCourse, description: e.target.value})}
                placeholder="Brief description of the course"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <input
                    type="text"
                    style={styles.input}
                    value={editCourse.category}
                    onChange={(e) => setEditCourse({...editCourse, category: e.target.value})}
                    placeholder="e.g., Programming, Database"
                />
                </div>

                <div style={styles.formGroup}>
                <label style={styles.label}>Difficulty</label>
                <select
                    style={styles.select}
                    value={editCourse.difficulty}
                    onChange={(e) => setEditCourse({...editCourse, difficulty: e.target.value})}
                >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
                </div>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Prerequisites (comma-separated)</label>
                <input
                type="text"
                style={styles.input}
                value={editCourse.preRequisites}
                onChange={(e) => setEditCourse({...editCourse, preRequisites: e.target.value})}
                placeholder="e.g., JavaScript, HTML, CSS"
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Skills Gained (comma-separated)</label>
                <input
                type="text"
                style={styles.input}
                value={editCourse.skillsGained}
                onChange={(e) => setEditCourse({...editCourse, skillsGained: e.target.value})}
                placeholder="e.g., React, Node.js, MongoDB"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={styles.formGroup}>
                <label style={styles.label}>Estimated Time</label>
                <input
                    type="text"
                    style={styles.input}
                    value={editCourse.eta}
                    onChange={(e) => setEditCourse({...editCourse, eta: e.target.value})}
                    placeholder="e.g., 4 weeks, 40 hours"
                />
                </div>

                <div style={styles.formGroup}>
                <label style={styles.label}>Badge Reward</label>
                <select
                  style={{
                    ...styles.input,
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: getBadgeColor(editCourse.badgeReward || 'Green'),
                    border: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    cursor: 'pointer',
                    textAlignLast: 'center'
                  }}
                  value={editCourse.badgeReward || 'Green'}
                  onChange={(e) =>
                    setEditCourse({ ...editCourse, badgeReward: e.target.value })
                  }
                >
                  {['Green', 'Cyan', 'Blue', 'Purple', 'Red'].map((badge) => (
                    <option
                      key={badge}
                      value={badge}
                      style={{
                        backgroundColor: getBadgeColor(badge),
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                    >
                      {badge}
                    </option>
                  ))}
                </select>
              </div>


            </div>

            <h3 style={{ fontSize: '20px', margin: '30px 0 20px 0', color: '#333' }}>
                Course Content
            </h3>

            <button
                type="button"
                style={styles.addContentButton}
                onClick={addEditContentModule}
                onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
            >
                <Plus size={16} />
                Add Content Module
            </button>

            {editCourse.content.map((module, index) => (
                <div key={index} style={styles.contentSection}>
                <div style={styles.contentHeader}>
                    <h4 style={{ margin: 0, color: '#333' }}>Module {index + 1}</h4>
                    <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => removeEditContentModule(index)}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                    <X size={14} />
                    </button>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Module Title</label>
                    <input
                    type="text"
                    style={styles.input}
                    value={module.title || ''}
                    onChange={(e) => updateEditContentModule(index, 'title', e.target.value)}
                    placeholder="e.g., Week 1: Introduction"
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Module Description</label>
                    <textarea
                    style={styles.textarea}
                    value={module.description || ''}
                    onChange={(e) => updateEditContentModule(index, 'description', e.target.value)}
                    placeholder="Detailed description of this module"
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Video URLs (one per line)</label>
                    <textarea
                    style={styles.textarea}
                    value={Array.isArray(module.videoUrl) ? module.videoUrl.join('\n') : ''}
                    onChange={(e) => updateEditContentModule(index, 'videoUrl', e.target.value.split('\n').filter(url => url.trim()))}
                    placeholder="https://example.com/video1&#10;https://example.com/video2"
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Resource Links (one per line)</label>
                    <textarea
                    style={styles.textarea}
                    value={Array.isArray(module.resourceLink) ? module.resourceLink.join('\n') : ''}
                    onChange={(e) => updateEditContentModule(index, 'resourceLink', e.target.value.split('\n').filter(url => url.trim()))}
                    placeholder="https://example.com/resource1&#10;https://example.com/resource2"
                    />
                </div>
                </div>
            ))}

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button
                type="button"
                style={styles.submitButton}
                disabled={loading}
                onClick={handleUpdateCourse}
                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#0056b3')}
                onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#007bff')}
                >
                <Save size={16} style={{marginRight: '8px'}} />
                {loading ? 'Updating...' : 'Update Course'}
                </button>
                
                <button
                type="button"
                style={{...styles.backButton, marginBottom: 0}}
                onClick={() => setView('detail')}
                >
                Cancel
                </button>
            </div>
            </div>
        </div>
        </div>
    );
    }

  return null;
};

export default AdminCoursesTab;
