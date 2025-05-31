import React, { useEffect, useState, useRef, useCallback } from 'react';
import makeAuthenticatedRequest from '../../utils/api';
import { apiRequest } from '../../utils/api';
import { 
  UserPlus, Trash2, Users, AlertCircle, Loader2, BookOpen, FolderOpen, 
  LogOut, Settings, Plus, Clock, Calendar, ArrowLeft, Edit, Play, FileText, 
  Link, Save, X, Award, Target, Eye, EyeOff, Phone, MapPin, User, Briefcase,
  GraduationCap, TrendingUp, ChevronDown, ChevronUp
} from 'lucide-react';
import AdminCoursesTab from './courses';
import AdminProjectsTab from './projects';

// Move this OUTSIDE the main component - this is crucial
const EmployeeForm = ({ 
  form, 
  onFormChange, 
  editingUser, 
  onSubmit, 
  loading, 
  error, 
  showPassword, 
  onTogglePassword,
  onCancel,
  styles 
}) => {
  // Create a stable input change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    onFormChange(name, value);
  }, [onFormChange]);

  return (
    <form onSubmit={onSubmit}>
      {error && (
        <div style={styles.error}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div style={styles.formSections}>
        <div style={styles.formSection}>
          <h4 style={styles.formSectionTitle}>Basic Information</h4>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Name *</label>
              <input
                key="name-input"
                style={styles.input}
                type="text"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email *</label>
              <input
                key="email-input"
                style={styles.input}
                type="email"
                name="email"
                value={form.email || ''}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password {editingUser ? '(leave blank to keep current)' : '*'}</label>
              <div style={styles.passwordContainer}>
                <input
                  key="password-input"
                  style={styles.input}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password || ''}
                  onChange={handleChange}
                  required={!editingUser}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={onTogglePassword}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Role</label>
              <select
                key="role-select"
                style={styles.select}
                name="role"
                value={form.role || 'employee'}
                onChange={handleChange}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone</label>
              <input
                key="phone-input"
                style={styles.input}
                type="tel"
                name="phone"
                value={form.phone || ''}
                onChange={handleChange}
                placeholder="e.g., +1 234 567 8900"
                autoComplete="off"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Join Date</label>
              <input
                key="joinDate-input"
                style={styles.input}
                type="date"
                name="joinDate"
                value={form.joinDate || ''}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div style={styles.formSection}>
          <h4 style={styles.formSectionTitle}>Professional Details</h4>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Department</label>
              <input
                key="department-input"
                style={styles.input}
                type="text"
                name="department"
                value={form.department || ''}
                onChange={handleChange}
                placeholder="e.g., Engineering, Marketing"
                autoComplete="off"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Position</label>
              <input
                key="position-input"
                style={styles.input}
                type="text"
                name="position"
                value={form.position || ''}
                onChange={handleChange}
                placeholder="e.g., Senior Developer, Designer"
                autoComplete="off"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Experience (years)</label>
              <input
                key="experience-input"
                style={styles.input}
                type="number"
                name="experience"
                value={form.experience || ''}
                onChange={handleChange}
                min="0"
                step="0.5"
                autoComplete="off"
              />
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Skills (comma-separated)</label>
            <textarea
              key="skills-textarea"
              style={styles.textarea}
              name="skills"
              value={form.skills || ''}
              onChange={handleChange}
              placeholder="e.g., JavaScript, React, Node.js, Project Management"
              rows="3"
              autoComplete="off"
            />
          </div>
        </div>

        <div style={styles.formSection}>
          <h4 style={styles.formSectionTitle}>Address Information</h4>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Street Address</label>
              <input
                key="street-input"
                style={styles.input}
                type="text"
                name="address.street"
                value={form.address?.street || ''}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>City</label>
              <input
                key="city-input"
                style={styles.input}
                type="text"
                name="address.city"
                value={form.address?.city || ''}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>State</label>
              <input
                key="state-input"
                style={styles.input}
                type="text"
                name="address.state"
                value={form.address?.state || ''}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>ZIP Code</label>
              <input
                key="zipCode-input"
                style={styles.input}
                type="text"
                name="address.zipCode"
                value={form.address?.zipCode || ''}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Country</label>
              <input
                key="country-input"
                style={styles.input}
                type="text"
                name="address.country"
                value={form.address?.country || ''}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div style={styles.formSection}>
          <h4 style={styles.formSectionTitle}>Emergency Contact</h4>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contact Name</label>
              <input
                key="emergencyName-input"
                style={styles.input}
                type="text"
                name="emergencyContact.name"
                value={form.emergencyContact?.name || ''}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Relationship</label>
              <input
                key="emergencyRelationship-input"
                style={styles.input}
                type="text"
                name="emergencyContact.relationship"
                value={form.emergencyContact?.relationship || ''}
                onChange={handleChange}
                placeholder="e.g., Spouse, Parent, Sibling"
                autoComplete="off"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contact Phone</label>
              <input
                key="emergencyPhone-input"
                style={styles.input}
                type="tel"
                name="emergencyContact.phone"
                value={form.emergencyContact?.phone || ''}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.formActions}>
        <button
          type="button"
          style={styles.cancelButton}
          onClick={onCancel}
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          style={{
            ...styles.submitButton,
            ...(loading ? styles.buttonDisabled : {})
          }}
          disabled={loading}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? (editingUser ? 'Updating...' : 'Adding...') : (editingUser ? 'Update Employee' : 'Add Employee')}
        </button>
      </div>
    </form>
  );
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    position: '',
    experience: '',
    skills: '',
    joinDate: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [expandedProfile, setExpandedProfile] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Scroll preservation
  const scrollPositionRef = useRef(0);

  const currentAdminId = () => localStorage.getItem('id') || '123';

  // Stable form change handler
  const handleFormChange = useCallback((name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  // Stable password toggle
  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Stable cancel handler
  const handleCancel = useCallback(() => {
    setDropdownOpen(false);
    setShowAddForm(false);
    setEditingUser(null);
    resetForm();
  }, []);

  // API helper function with authentication
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await makeAuthenticatedRequest(`/api${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    window.location.href = '/';
  };

  // Scroll preservation functions
  const saveScrollPosition = () => {
    scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
  };

  const restoreScrollPosition = () => {
    if (scrollPositionRef.current > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'instant'
        });
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setFetchLoading(true);
      const data = await apiRequest('/user/getAllUsers');
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users: ' + err.message);
      setUsers([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchUserCourseProgress = async (userId) => {
    try {
      const data = await apiRequest(`/user/getUserCourses/${userId}`);
      return data;
    } catch (error) {
      console.error('Failed to fetch course progress:', error);
      return [];
    }
  };

  const fetchUserProjectProgress = async (userId) => {
    try {
      const data = await apiRequest(`/user/getUserProjects/${userId}`);
      return data;
    } catch (error) {
      console.error('Failed to fetch project progress:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    saveScrollPosition();
    setLoading(true);
    setError('');
    
    try {
      const userData = {
        ...form,
        skills: form.skills ? form.skills.split(',').map(skill => skill.trim()) : [],
        experience: form.experience ? parseFloat(form.experience) : 0
      };

      const data = await apiRequest('/user/addUser', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      setUsers((prev) => [...prev, data.user]);
      resetForm();
      setShowAddForm(false);
      setDropdownOpen(false);
      
      setTimeout(restoreScrollPosition, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    saveScrollPosition();
    setLoading(true);
    setError('');
    
    try {
      const userData = {
        ...form,
        skills: form.skills ? form.skills.split(',').map(skill => skill.trim()) : [],
        experience: form.experience ? parseFloat(form.experience) : 0
      };

      if (!userData.password) {
        delete userData.password;
      }

      const data = await apiRequest(`/user/ModifyProfile/${editingUser._id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      setUsers(prev => prev.map(user => 
        user._id === editingUser._id ? data.user : user
      ));
      resetForm();
      setEditingUser(null);
      setShowAddForm(false);
      setDropdownOpen(false);
      
      setTimeout(restoreScrollPosition, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    saveScrollPosition();
    
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'employee',
      department: user.department || '',
      position: user.position || '',
      experience: user.experience || '',
      skills: user.skills ? user.skills.join(', ') : '',
      joinDate: user.joinDate ? user.joinDate.split('T')[0] : '',
      phone: user.phone || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || ''
      },
      emergencyContact: {
        name: user.emergencyContact?.name || '',
        relationship: user.emergencyContact?.relationship || '',
        phone: user.emergencyContact?.phone || ''
      }
    });
    setEditingUser(user);
    setShowAddForm(true);
    setDropdownOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    saveScrollPosition();
    
    try {
      await apiRequest(`/user/deleteUser/${id}`, {
        method: 'DELETE'
      });

      setUsers(users.filter((user) => user._id !== id));
      setTimeout(restoreScrollPosition, 0);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: '',
      position: '',
      experience: '',
      skills: '',
      joinDate: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    });
    setEditingUser(null);
  };

  const toggleDropdown = useCallback(() => {
    if (!dropdownOpen) {
      setDropdownOpen(true);
      setShowAddForm(true);
      if (!editingUser) {
        resetForm();
      }
    } else {
      setDropdownOpen(false);
      setShowAddForm(false);
      setEditingUser(null);
    }
  }, [dropdownOpen, editingUser]);

  // Extract courses and projects from performanceMetrics
  const extractGoalsFromPerformanceMetrics = (user) => {
    const courses = [];
    const projects = [];
    
    if (user.performanceMetrics && user.performanceMetrics.length > 0) {
      user.performanceMetrics.forEach(metric => {
        if (metric.goals && metric.goals.length > 0) {
          metric.goals.forEach(goal => {
            const goalData = {
              title: goal.title,
              description: goal.description,
              status: goal.status,
              completedAt: goal.completedAt,
              period: metric.period
            };
            
            if (goal.mode === 'Training') {
              courses.push(goalData);
            } else if (goal.mode === 'Project') {
              projects.push(goalData);
            }
          });
        }
      });
    }
    
    return { courses, projects };
  };

  // Helper function to get status color and styling
  const getGoalStatusStyle = (status) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    };
    
    switch (status) {
      case 'completed':
        return {
          ...baseStyle,
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb'
        };
      case 'in-progress':
        return {
          ...baseStyle,
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeaa7'
        };
      case 'pending':
        return {
          ...baseStyle,
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#e2e3e5',
          color: '#383d41',
          border: '1px solid #d6d8db'
        };
    }
  };

  const UserProfileCard = ({ user }) => {
    const [courseProgress, setCourseProgress] = useState([]);
    const [projectProgress, setProjectProgress] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(false);

    useEffect(() => {
      if (expandedProfile === user._id) {
        setLoadingProgress(true);
        Promise.all([
          fetchUserCourseProgress(user._id),
          fetchUserProjectProgress(user._id)
        ]).then(([courses, projects]) => {
          setCourseProgress(courses);
          setProjectProgress(projects);
        }).finally(() => {
          setLoadingProgress(false);
        });
      }
    }, [expandedProfile, user._id]);

    const { courses, projects } = extractGoalsFromPerformanceMetrics(user);

    return (
      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div style={styles.profileInfo}>
            <h3 style={styles.profileName}>{user.name}</h3>
            <p style={styles.profileEmail}>{user.email}</p>
            <div style={styles.profileTags}>
              <span style={getRoleTagStyle(user.role)}>{user.role}</span>
              {user.department && (
                <span style={styles.departmentTag}>{user.department}</span>
              )}
            </div>
          </div>
          <div style={styles.profileActions}>
            <button
              style={styles.editButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpandedProfile(expandedProfile === user._id ? null : user._id);
              }}
              type="button"
            >
              <Eye size={14} />
              {expandedProfile === user._id ? 'Hide Details' : 'View Details'}
            </button>
            <button
              style={styles.editButton}
              onClick={(e) => handleEditUser(user, e)}
              type="button"
            >
              <Edit size={14} />
              Edit
            </button>
            {user._id !== currentAdminId() && (
              <button
                style={styles.deleteButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteUser(user._id);
                }}
                type="button"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {expandedProfile === user._id && (
          <div style={styles.profileDetails}>
            {loadingProgress ? (
              <div style={styles.loadingProgress}>
                <Loader2 size={20} className="animate-spin" />
                Loading profile details...
              </div>
            ) : (
              <>
                <div style={styles.profileSection}>
                  <h4 style={styles.sectionTitle}>
                    <Briefcase size={16} />
                    Professional Information
                  </h4>
                  <div style={styles.profileGrid}>
                    <div><strong>Position:</strong> {user.position || 'Not specified'}</div>
                    <div><strong>Experience:</strong> {user.experience || 0} years</div>
                    <div><strong>Join Date:</strong> {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Not specified'}</div>
                    <div><strong>Phone:</strong> {user.phone || 'Not provided'}</div>
                  </div>
                </div>

                {user.address && (Object.values(user.address).some(val => val)) && (
                  <div style={styles.profileSection}>
                    <h4 style={styles.sectionTitle}>
                      <MapPin size={16} />
                      Address
                    </h4>
                    <div style={styles.addressInfo}>
                      {user.address.street && <div>{user.address.street}</div>}
                      {(user.address.city || user.address.state) && (
                        <div>{user.address.city}{user.address.city && user.address.state ? ', ' : ''}{user.address.state}</div>
                      )}
                      {user.address.zipCode && <div>{user.address.zipCode}</div>}
                      {user.address.country && <div>{user.address.country}</div>}
                    </div>
                  </div>
                )}

                {user.emergencyContact && (user.emergencyContact.name || user.emergencyContact.phone) && (
                  <div style={styles.profileSection}>
                    <h4 style={styles.sectionTitle}>
                      <Phone size={16} />
                      Emergency Contact
                    </h4>
                    <div style={styles.profileGrid}>
                      {user.emergencyContact.name && <div><strong>Name:</strong> {user.emergencyContact.name}</div>}
                      {user.emergencyContact.relationship && <div><strong>Relationship:</strong> {user.emergencyContact.relationship}</div>}
                      {user.emergencyContact.phone && <div><strong>Phone:</strong> {user.emergencyContact.phone}</div>}
                    </div>
                  </div>
                )}

                <div style={styles.profileSection}>
                  <h4 style={styles.sectionTitle}>
                    <Award size={16} />
                    Skills
                  </h4>
                  <div style={styles.skillsContainer}>
                    {user.skills && user.skills.length > 0 ? 
                      user.skills.map((skill, index) => (
                        <span key={index} style={styles.skillTag}>{skill}</span>
                      )) : 
                      <span style={styles.noData}>No skills listed</span>
                    }
                  </div>
                </div>

                <div style={styles.profileSection}>
                  <h4 style={styles.sectionTitle}>
                    <GraduationCap size={16} />
                    Course Progress
                  </h4>
                  <div style={styles.progressContainer}>
                    {courses.length > 0 ? courses.map((course, index) => (
                      <div key={index} style={styles.progressItem}>
                        <div style={styles.progressHeader}>
                          <span style={styles.courseName}>{course.title}</span>
                          <span style={getGoalStatusStyle(course.status)}>
                            {course.status}
                          </span>
                        </div>
                        {course.description && (
                          <div style={styles.courseDescription}>
                            {course.description}
                          </div>
                        )}
                        <div style={styles.progressMeta}>
                          <span>Period: {course.period}</span>
                          {course.completedAt && (
                            <span>Completed: {new Date(course.completedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <span style={styles.noData}>No courses assigned</span>
                    )}
                  </div>
                </div>

                <div style={styles.profileSection}>
                  <h4 style={styles.sectionTitle}>
                    <TrendingUp size={16} />
                    Project Progress
                  </h4>
                  <div style={styles.projectsList}>
                    {projects.length > 0 ? projects.map((project, index) => (
                      <div key={index} style={styles.projectItem}>
                        <div style={styles.projectInfo}>
                          <span style={styles.projectName}>{project.title}</span>
                          <span style={getGoalStatusStyle(project.status)}>
                            {project.status}
                          </span>
                        </div>
                        {project.description && (
                          <div style={styles.projectDescription}>
                            {project.description}
                          </div>
                        )}
                        <div style={styles.projectMeta}>
                          <span>Period: {project.period}</span>
                          {project.completedAt && (
                            <span>Completed: {new Date(project.completedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <span style={styles.noData}>No projects assigned</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // All your styles remain the same... (keeping them as they were)
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
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '32px',
      color: 'white',
      textAlign: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    contentBody: {
      padding: '32px'
    },
    section: {
      marginBottom: '40px'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    dropdownContainer: {
      position: 'relative',
      display: 'inline-block',
      marginBottom: '24px'
    },
    button: {
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    buttonActive: {
      backgroundColor: '#5a67d8'
    },
    dropdownContent: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      minWidth: '800px',
      maxHeight: '80vh',
      overflowY: 'auto',
      marginTop: '4px'
    },
    dropdownHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid #f3f4f6',
      backgroundColor: '#f9fafb'
    },
    dropdownTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '4px',
      borderRadius: '4px',
      transition: 'all 0.2s'
    },
    formSections: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    formSection: {
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    formSectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e5e7eb'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px'
    },
    input: {
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'all 0.2s',
      outline: 'none'
    },
    textarea: {
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'all 0.2s',
      outline: 'none',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    select: {
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      outline: 'none'
    },
    passwordContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '4px'
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      paddingTop: '16px',
      borderTop: '1px solid #f3f4f6'
    },
    cancelButton: {
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    submitButton: {
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    error: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#b91c1c',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    profileCard: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    profileHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    profileInfo: {
      flex: 1
    },
    profileName: {
      fontSize: '18px',
      fontWeight: '600',
      margin: '0 0 4px 0',
      color: '#1f2937'
    },
    profileEmail: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '0 0 8px 0'
    },
    profileTags: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    departmentTag: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    profileActions: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    editButton: {
      backgroundColor: '#17a2b8',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    profileDetails: {
      borderTop: '1px solid #f3f4f6',
      paddingTop: '16px'
    },
    profileSection: {
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    profileGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      fontSize: '14px'
    },
    addressInfo: {
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#374151'
    },
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    skillTag: {
      backgroundColor: '#e0f2fe',
      color: '#0277bd',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    progressContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    progressItem: {
      backgroundColor: '#f9fafb',
      padding: '12px',
      borderRadius: '6px'
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500'
    },
    progressPercentage: {
      color: '#10b981',
      fontWeight: '600'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '8px'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#10b981',
      transition: 'width 0.3s ease'
    },
    progressMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#6b7280'
    },
    projectsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    projectItem: {
      backgroundColor: '#f9fafb',
      padding: '12px',
      borderRadius: '6px'
    },
    projectInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    projectName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    projectMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#6b7280'
    },
    noData: {
      color: '#9ca3af',
      fontStyle: 'italic',
      fontSize: '14px'
    },
    loadingProgress: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#6b7280',
      fontSize: '14px',
      padding: '20px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: '#6b7280'
    },
    loadingOverlay: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px'
    },
    roleTag: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    adminTag: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    managerTag: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    employeeTag: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    }
  };

  const getRoleTagStyle = (role) => {
    switch (role) {
      case 'admin':
        return { ...styles.roleTag, ...styles.adminTag };
      case 'manager':
        return { ...styles.roleTag, ...styles.managerTag };
      default:
        return { ...styles.roleTag, ...styles.employeeTag };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      case 'in-progress':
        return { backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      case 'on-hold':
        return { backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.navBrand}>
            <Settings size={24} />
            Admin Dashboard
          </div>
          <div style={styles.navTabs}>
            <button
              style={{
                ...styles.navTab,
                ...(activeTab === 'users' ? styles.navTabActive : {})
              }}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('users');
              }}
              type="button"
            >
              <Users size={16} />
              Users
            </button>
            <button
              style={{
                ...styles.navTab,
                ...(activeTab === 'courses' ? styles.navTabActive : {})
              }}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('courses');
              }}
              type="button"
            >
              <BookOpen size={16} />
              Courses
            </button>
            <button
              style={{
                ...styles.navTab,
                ...(activeTab === 'projects' ? styles.navTabActive : {})
              }}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('projects');
              }}
              type="button"
            >
              <FolderOpen size={16} />
              Projects
            </button>
          </div>
          <button 
            style={styles.logoutButton} 
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            type="button"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.main}>
        {activeTab === 'users' && (
          <div style={styles.content}>
            <div style={styles.header}>
              <h1 style={styles.title}>
                <Users size={32} />
                Employee Management
              </h1>
            </div>
            <div style={styles.contentBody}>
              <div style={styles.section}>
                <div className="dropdown-container" style={styles.dropdownContainer}>
                  <button
                    style={{
                      ...styles.button,
                      ...(dropdownOpen ? styles.buttonActive : {})
                    }}
                    onClick={toggleDropdown}
                    type="button"
                  >
                    <UserPlus size={16} />
                    {editingUser ? 'Edit Employee' : 'Add New Employee'}
                    {dropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {dropdownOpen && showAddForm && (
                    <div style={styles.dropdownContent}>
                      <div style={styles.dropdownHeader}>
                        <h3 style={styles.dropdownTitle}>
                          {editingUser ? 'Edit Employee' : 'Add New Employee'}
                        </h3>
                        <button
                          style={styles.closeButton}
                          onClick={handleCancel}
                          type="button"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <EmployeeForm
                        form={form}
                        onFormChange={handleFormChange}
                        editingUser={editingUser}
                        onSubmit={editingUser ? handleUpdateUser : handleAddUser}
                        loading={loading}
                        error={error}
                        showPassword={showPassword}
                        onTogglePassword={handleTogglePassword}
                        onCancel={handleCancel}
                        styles={styles}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <Users size={20} />
                  Employee Profiles ({users.length})
                </h2>
                {fetchLoading ? (
                  <div style={styles.loadingOverlay}>
                    <Loader2 size={24} className="animate-spin" />
                    Loading employees...
                  </div>
                ) : users.length > 0 ? (
                  <div>
                    {users.map((user) => (
                      <UserProfileCard key={user._id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <Users size={48} />
                    <h3>No employees found</h3>
                    <p>Add your first employee to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && <AdminCoursesTab />}
        {activeTab === 'projects' && <AdminProjectsTab />}
      </div>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
