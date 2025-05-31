import React, { useEffect, useState, useCallback } from 'react';
import { FolderOpen, Plus, Trash2, Edit, Save, X, Users, Calendar, Target, FileText, AlertCircle, Loader2, Clock, BriefcaseBusiness, Award, ChevronDown, ChevronUp } from 'lucide-react';
import makeAuthenticatedRequest from '../../utils/api';
const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
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
    content: {
      padding: '32px'
    },
    section: {
      marginBottom: '40px'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
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
    buttonSecondary: {
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    },
    buttonDanger: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    },
    form: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px',
      marginBottom: '20px'
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
      minHeight: '80px',
      resize: 'vertical'
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
    multiSelect: {
      padding: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white',
      minHeight: '100px'
    },
    // New styles for skills input
    skillsContainer: {
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      padding: '8px',
      minHeight: '44px'
    },
    skillsTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      marginBottom: '8px'
    },
    skillTag: {
      backgroundColor: '#e0f2fe',
      color: '#0277bd',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    skillRemoveBtn: {
      background: 'none',
      border: 'none',
      color: '#0277bd',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      padding: '0',
      marginLeft: '4px'
    },
    helpText: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
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
    projectGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '24px'
    },
    projectCard: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s'
    },
    projectCardHover: {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)'
    },
    projectHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    projectTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0 0 4px 0'
    },
    projectMeta: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
      flexWrap: 'wrap'
    },
    tag: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    projectDescription: {
      color: '#6b7280',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '16px'
    },
    projectDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontSize: '14px',
      color: '#6b7280'
    },
    projectDetailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    projectActions: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #f3f4f6'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6b7280'
    },
    loadingOverlay: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px'
    },
    // New styles for badge dropdown
  badgeOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px'
  },
  badgeColorIndicator: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  },
  
  // Enhanced skill tag styles
  skillTagSmall: {
    backgroundColor: '#e0f2fe',
    color: '#0277bd',
    padding: '2px 6px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: '500',
    display: 'inline-block',
    margin: '2px'
  },
  
  // Assigned users expandable section
  assignedUsersSection: {
    marginTop: '8px'
  },
  assignedUsersHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '4px 0',
    fontSize: '14px',
    color: '#6b7280'
  },
  assignedUsersList: {
    marginTop: '8px',
    paddingLeft: '20px'
  },
  assignedUserItem: {
    fontSize: '12px',
    color: '#6b7280',
    padding: '2px 0'
  }
};



// Badge color mapping
const getBadgeColorValue = (badge) => {
  const colors = {
    'Green': '#10b981',
    'Cyan': '#06b6d4', 
    'Blue': '#3b82f6',
    'Purple': '#8b5cf6',
    'Red': '#ef4444'
  };
  return colors[badge] || '#6b7280';
};

// Custom Badge Select Component
const BadgeSelect = ({ value, onChange, name }) => {
  const badges = ['Green', 'Cyan', 'Blue', 'Purple', 'Red'];
  
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      style={styles.select}
    >
      <option value="">Select a badge</option>
      {badges.map(badge => (
        <option key={badge} value={badge}>
          {badge} Badge
        </option>
      ))}
    </select>
  );
};

// Expandable Assigned Users Component
const AssignedUsersDisplay = ({ users }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!users || users.length === 0) {
    return (
      <div style={styles.projectDetailItem}>
        <Users size={16} />
        <span>0 assigned</span>
      </div>
    );
  }
  
  return (
    <div>
      <div style={styles.projectDetailItem}>
        <Users size={16} />
        <span>{users.length} assigned</span>
      </div>
      <div style={styles.assignedUsersSection}>
        <div 
          style={styles.assignedUsersHeader}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>View assigned users</span>
        </div>
        {expanded && (
          <div style={styles.assignedUsersList}>
            {users.map((user, index) => (
              <div key={user._id || index} style={styles.assignedUserItem}>
                • {user.name || user}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Skills Display Component
const SkillsDisplay = ({ skills, label, icon: Icon }) => {
  if (!skills || skills.length === 0) return null;
  
  return (
    <div style={styles.projectDetailItem}>
      <Icon size={16} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
        <span style={{ marginRight: '8px' }}>{label}:</span>
        {skills.map((skill, index) => (
          <span key={index} style={styles.skillTagSmall}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

// Move SkillsInput component outside to prevent re-renders
const SkillsInput = ({ label, name, value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = inputValue.trim();
      if (skill && !value.includes(skill)) {
        onChange(name, [...value, skill]);
        setInputValue('');
      }
    }
  }, [inputValue, value, onChange, name]);

  const removeSkill = useCallback((skillToRemove) => {
    onChange(name, value.filter(skill => skill !== skillToRemove));
  }, [value, onChange, name]);

  return (
    <div style={styles.inputGroup}>
      <label style={styles.label}>{label}</label>
      <div style={styles.skillsContainer}>
        <div style={styles.skillsTags}>
          {value.map((skill, index) => (
            <span key={index} style={styles.skillTag}>
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                style={styles.skillRemoveBtn}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={styles.input}
        />
        <small style={styles.helpText}>Press Enter or comma to add skills</small>
      </div>
    </div>
  );
};

export default function AdminProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [managersAndAdmins, setManagersAndAdmins] = useState([]); // New state
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    assignedUsers: [],
    deadline: '',
    budget: '',
    skillsRequired: [],
    skillsGained: [],
    managerId: '', // This will now select from all users
    badgeReward: ''
  });
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  
const fetchProjects = async () => {
  try {
    setFetchLoading(true);
    
    const response = await makeAuthenticatedRequest('/api/project/getAllProjects');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check different possible response formats
    if (data.projects) {
      setProjects(data.projects);
    } else if (Array.isArray(data)) {
      setProjects(data);
    } else {
      setProjects([]);
    }
    
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    setError('Failed to fetch projects: ' + error.message);
    setProjects([]);
  } finally {
    setFetchLoading(false);
  }
};

  const fetchUsers = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/user/getAllUsers');
      if (response.ok) {
        const data = await response.json();
        const allUsers = data.users || data || [];
        
        // Store all users
        setUsers(allUsers);
        
        // Filter managers and admins for project lead dropdown
        const leadCandidates = allUsers.filter(user => 
          user.role === 'manager' || user.role === 'admin'
        );
        setManagersAndAdmins(leadCandidates);
        
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleFormChange = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'assignedUsers') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => ({
        _id: option.value,
        name: option.text
      }));
      setForm({ ...form, [name]: selectedOptions });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
  if (!form.name.trim() || !form.description.trim()) {
    setError('Name and description are required');
    return;
  }

  if (!form.managerId) {
    setError('Please select a project manager/lead');
    return;
  }
  
  setLoading(true);
  setError('');

  try {
    // Keep managerId in the payload since backend needs it
    const projectData = {
      name: form.name,
      description: form.description,
      status: form.status,
      priority: form.priority,
      assignedUsers: form.assignedUsers,
      deadline: form.deadline,
      budget: form.budget,
      skillsRequired: form.skillsRequired,
      skillsGained: form.skillsGained,
      badgeReward: form.badgeReward,
      managerId: form.managerId // Send this to backend
    };
    
    // Add selected manager to assignedUsers if not already included
    if (form.managerId && !projectData.assignedUsers.some(user => user._id === form.managerId)) {
      const selectedUser = users.find(u => u._id === form.managerId);
      if (selectedUser) {
        projectData.assignedUsers.push({
          _id: selectedUser._id,
          name: selectedUser.name
        });
      }
    }
    
    const url = editingProject 
      ? `/api/project/modifyProject/${editingProject._id}`
      : '/api/project/addProject';
    
    const method = editingProject ? 'PUT' : 'POST';
    
    const res = await makeAuthenticatedRequest(url, {
      method,
      body: JSON.stringify(projectData),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to save project');
    }
    
    const data = await res.json();
    
    if (editingProject) {
      const updatedProjects = projects.map(project =>
        project._id === editingProject._id ? data.project : project
      );
      setProjects(updatedProjects);
      setEditingProject(null);
    } else {
      setProjects([...projects, data.project]);
    }
    
    resetForm();
  } catch (err) {
    setError(err.message || 'Failed to save project');
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (project) => {
    // Find the first assigned user to pre-select as manager (optional logic)
    const firstAssignedUser = project.assignedUsers?.[0];

    setForm({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      assignedUsers: project.assignedUsers,
      deadline: project.deadline,
      budget: project.budget,
      skillsRequired: project.skillsRequired || [],
      skillsGained: project.skillsGained || [],
      managerId: firstAssignedUser?._id || '',
      badgeReward: project.badgeReward || ''
    });
    setEditingProject(project);
    setShowForm(true);
  };

    
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await makeAuthenticatedRequest(`/api/project/deleteProject/${id}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }
      
      setProjects(projects.filter(project => project._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    }
  };
  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      assignedUsers: [],
      deadline: '',
      budget: '',
      skillsRequired: [],
      skillsGained: [],
      managerId: '',
      badgeReward: ''
    });
    setEditingProject(null);
    setShowForm(false);
    setError('');
  };

    const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'in-progress':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'on-hold':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return { backgroundColor: '#fecaca', color: '#b91c1c' };
      case 'medium':
        return { backgroundColor: '#fed7aa', color: '#c2410c' };
      default:
        return { backgroundColor: '#d1fae5', color: '#065f46' };
    }
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'Green': { backgroundColor: '#dcfce7', color: '#166534' },
      'Cyan': { backgroundColor: '#cffafe', color: '#155e75' },
      'Blue': { backgroundColor: '#dbeafe', color: '#1e40af' },
      'Purple': { backgroundColor: '#e9d5ff', color: '#7c3aed' },
      'Red': { backgroundColor: '#fee2e2', color: '#dc2626' }
    };
    return colors[badge] || { backgroundColor: '#f3f4f6', color: '#374151' };
  };

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <FolderOpen size={36} />
            Projects Dashboard
          </h1>
        </div>

        <div style={styles.content}>
          <div style={styles.section}>
            {/* ... existing section header ... */}
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                {editingProject ? <Edit size={24} /> : <Plus size={24} />}
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              {!showForm && (
                <button
                  style={styles.button}
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={16} />
                  Add Project
                </button>
              )}
            </div>

            {showForm && (
              <div style={styles.form}>
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Project Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter project name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option value="planning">Planning</option>
                      <option value="in-progress">In Progress</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Priority</label>
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Manager/Lead Selection from All Users */}
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Project Manager</label>
                    <select
                      name="managerId"
                      value={form.managerId}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option value="">Select a Manager</option>
                      {managersAndAdmins.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} - {user.role} {user.department ? `(${user.department})` : ''}
                        </option>
                      ))}
                    </select>
                    {managersAndAdmins.length === 0 && (
                      <small style={{ color: '#6b7280', fontSize: '12px' }}>
                        No managers or admins available
                      </small>
                    )}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Budget ($)</label>
                    <input
                      type="number"
                      name="budget"
                      placeholder="Enter budget"
                      value={form.budget}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={form.deadline}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>

                  {/* Enhanced Badge Reward Dropdown */}
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      Badge Reward
                      {form.badgeReward && (
                        <span style={{ marginLeft: '8px' }}>
                          <span 
                            style={{
                              ...styles.badgeColorIndicator,
                              backgroundColor: getBadgeColorValue(form.badgeReward),
                              display: 'inline-block',
                              verticalAlign: 'middle'
                            }}
                          />
                        </span>
                      )}
                    </label>
                    <BadgeSelect
                      name="badgeReward"
                      value={form.badgeReward}
                      onChange={handleInputChange}
                    />
                  </div>


                   <div style={styles.inputGroup}>
                    <label style={styles.label}>Team Members</label>
                    <div style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px', minHeight: '44px' }}>
                      {users.map(user => {
                        const isSelected = form.assignedUsers.some(u => u._id === user._id || u === user._id);
                        const isProjectLead = form.managerId === user._id;
                        
                        return (
                          <label key={user._id} style={{ display: 'block', marginBottom: '4px' }}>
                            <input
                              type="checkbox"
                              value={user._id}
                              checked={isSelected}
                              onChange={(e) => {
                                let updated;
                                if (e.target.checked) {
                                  updated = [...form.assignedUsers, { _id: user._id, name: user.name }];
                                } else {
                                  updated = form.assignedUsers.filter(u => (u._id || u) !== user._id);
                                }
                                setForm({ ...form, assignedUsers: updated });
                              }}
                            />
                            {' '}
                            {user.name} ({user.role})
                            {isProjectLead && (
                              <span style={{ 
                                color: '#10b981', 
                                fontWeight: 'bold',
                                marginLeft: '8px'
                              }}>
                                - Project Manager
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>



                </div>

                {/* Skills sections */}
                <SkillsInput
                  label="Skills Required"
                  name="skillsRequired"
                  value={form.skillsRequired}
                  onChange={handleFormChange}
                  placeholder="Type skills and press Enter or comma to add"
                />

                <SkillsInput
                  label="Skills Gained"
                  name="skillsGained"
                  value={form.skillsGained}
                  onChange={handleFormChange}
                  placeholder="Type skills and press Enter or comma to add"
                />

                <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter project description"
                    value={form.description}
                    onChange={handleInputChange}
                    required
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.formActions}>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={styles.buttonSecondary}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={styles.button}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} style={{animation: 'spin 1s linear infinite'}} />
                        {editingProject ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {editingProject ? 'Update Project' : 'Create Project'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

                    {/* Error Display */}
          {error && (
            <div style={styles.error}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Projects List Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <FolderOpen size={24} />
              All Projects ({projects.length})
            </h2>

            {fetchLoading ? (
              <div style={styles.loadingOverlay}>
                <Loader2 size={32} style={{animation: 'spin 1s linear infinite'}} />
              </div>
            ) : projects.length > 0 ? (
              <div style={styles.projectGrid}>
                {projects.map(project => (
                  <div
                    key={project._id}
                    style={styles.projectCard}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.projectCardHover)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.projectCard)}
                  >
                    <div style={styles.projectHeader}>
                      <h3 style={styles.projectTitle}>{project.name}</h3>
                    </div>

                    <div style={styles.projectMeta}>
                      <span style={{...styles.tag, ...getStatusColor(project.status)}}>
                        {project.status}
                      </span>
                      <span style={{...styles.tag, ...getPriorityColor(project.priority)}}>
                        {project.priority}
                      </span>
                      {project.badgeReward && (
                        <span style={{
                          ...styles.tag, 
                          ...getBadgeColor(project.badgeReward),
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span 
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: getBadgeColorValue(project.badgeReward)
                            }}
                          />
                          {project.badgeReward} Badge
                        </span>
                      )}
                    </div>

                    <p style={styles.projectDescription}>
                      {project.description}
                    </p>

                    {/* Enhanced Skills Display */}
                    <SkillsDisplay 
                      skills={project.skillsRequired} 
                      label="Skills Required" 
                      icon={Target} 
                    />
                    
                    <SkillsDisplay 
                      skills={project.skillsGained} 
                      label="Skills Gained" 
                      icon={Award} 
                    />

                    <div style={styles.projectDetails}>
                      {/* Enhanced Assigned Users Display */}
                      <AssignedUsersDisplay users={project.assignedUsers} />
                      
                      {project.deadline && (
                        <div style={styles.projectDetailItem}>
                          <Calendar size={16} />
                          <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {project.budget && (
                        <div style={styles.projectDetailItem}>
                          <Target size={16} />
                          <span>Budget: ${parseInt(project.budget).toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div style={styles.projectDetailItem}>
                        <Clock size={16} />
                        <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div style={styles.projectDetailItem}>
                  <BriefcaseBusiness size={16} />
                  <span>
                    Managed by: {project.managedBy?.name || 'Admin'}
                  </span>
                </div>
              </div>

                <div style={styles.projectActions}>
                  {project.status === 'completed' ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      <Award size={16} style={{ marginRight: '8px' }} />
                      Project Completed
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(project)}
                        style={styles.buttonSecondary}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        style={styles.buttonDanger}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <FolderOpen size={64} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                  No projects found
                </div>
                <div style={{ fontSize: '14px' }}>
                  Create your first project to get started
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
            <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

































































