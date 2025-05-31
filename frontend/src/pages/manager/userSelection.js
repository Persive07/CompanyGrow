// manager/userSelection.js
import React, { useState, useEffect } from 'react';
import makeAuthenticatedRequest from '../../utils/api';
const UserSelection = ({ projectId, currentAssignedUsers, onClose, onConfirm }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');

  useEffect(() => {
    fetchAllUsers();
    // Initialize selected users with currently assigned users
    setSelectedUsers(new Set(currentAssignedUsers.map(user => user._id)));
  }, [currentAssignedUsers]);

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await makeAuthenticatedRequest('/api/user/getAllUsers');

      if (response.ok) {
        const users = await response.json();
        setAllUsers(users);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

const handleConfirm = async () => {
  setSaving(true);
  try {
    const token = localStorage.getItem('token');
    const managerId = localStorage.getItem('id');
    
    // Get selected user IDs
    const selectedUserIds = Array.from(selectedUsers);
    
    // Send only the fields we want to update
    const updateData = {
      assignedUsers: selectedUserIds
    };

    const response = await makeAuthenticatedRequest(`/api/project/modifyUsers/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Project assignments updated successfully:', result);
      onConfirm();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update project assignments');
    }
    
  } catch (error) {
    console.error('Error updating assignments:', error);
    alert(`Error updating project assignments: ${error.message}`);
  } finally {
    setSaving(false);
  }
};





  const getFilteredUsers = () => {
    return allUsers.filter(user => {
      const roleMatch = !roleFilter || user.role === roleFilter;
      const departmentMatch = !departmentFilter || user.department === departmentFilter;
      const skillsMatch = !skillsFilter || 
        user.skills.some(skill => skill.toLowerCase().includes(skillsFilter.toLowerCase()));
      
      return roleMatch && departmentMatch && skillsMatch;
    });
  };

  // Sort users: assigned first, then unassigned
  const getSortedUsers = () => {
    const filtered = getFilteredUsers();
    const assigned = filtered.filter(user => currentAssignedUsers.some(assigned => assigned._id === user._id));
    const unassigned = filtered.filter(user => !currentAssignedUsers.some(assigned => assigned._id === user._id));
    return [...assigned, ...unassigned];
  };

  const styles = {
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
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      maxWidth: '900px',
      maxHeight: '80vh',
      overflow: 'auto',
      width: '90%',
      padding: '2rem'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      borderBottom: '1px solid #eee',
      paddingBottom: '1rem'
    },
    title: {
      fontSize: '1.5rem',
      color: '#2c3e50',
      margin: 0
    },
    closeButton: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      cursor: 'pointer'
    },
    filtersContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '5px'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    filterLabel: {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      color: '#34495e',
      marginBottom: '0.5rem'
    },
    filterSelect: {
      padding: '0.5rem',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '1rem'
    },
    filterInput: {
      padding: '0.5rem',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '1rem'
    },
    usersList: {
      maxHeight: '400px',
      overflow: 'auto',
      border: '1px solid #dee2e6',
      borderRadius: '5px'
    },
    userItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      borderBottom: '1px solid #ecf0f1',
      backgroundColor: 'white'
    },
    assignedUserItem: {
      backgroundColor: '#e8f5e8'
    },
    checkbox: {
      marginRight: '1rem',
      transform: 'scale(1.2)'
    },
    userInfo: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr',
      gap: '1rem',
      alignItems: 'center'
    },
    userDetail: {
      fontSize: '0.9rem'
    },
    userName: {
      fontWeight: 'bold',
      color: '#2c3e50'
    },
    userEmail: {
      color: '#7f8c8d'
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.25rem'
    },
    skillTag: {
      backgroundColor: '#e74c3c',
      color: 'white',
      padding: '0.2rem 0.5rem',
      borderRadius: '10px',
      fontSize: '0.7rem'
    },
    actions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      marginTop: '1.5rem',
      paddingTop: '1rem',
      borderTop: '1px solid #eee'
    },
    confirmButton: {
      backgroundColor: '#27ae60',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '5px',
      cursor: 'pointer'
    },
    cancelButton: {
      backgroundColor: '#95a5a6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '5px',
      cursor: 'pointer'
    }
  };

  if (loading) {
    return (
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          <h2>Loading users...</h2>
        </div>
      </div>
    );
  }

  const sortedUsers = getSortedUsers();
  const uniqueDepartments = [...new Set(allUsers.map(user => user.department).filter(Boolean))];
  const uniqueRoles = [...new Set(allUsers.map(user => user.role))];

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.header}>
          <h2 style={styles.title}>Assign Users to Project</h2>
          <button style={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>

        {/* Filters */}
        <div style={styles.filtersContainer}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filter by Role:</label>
            <select
              style={styles.filterSelect}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filter by Department:</label>
            <select
              style={styles.filterSelect}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
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
        </div>

        {/* Users List */}
        <div style={styles.usersList}>
          {sortedUsers.map(user => {
            const isCurrentlyAssigned = currentAssignedUsers.some(assigned => assigned._id === user._id);
            return (
              <div
                key={user._id}
                style={{
                  ...styles.userItem,
                  ...(isCurrentlyAssigned ? styles.assignedUserItem : {})
                }}
              >
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={selectedUsers.has(user._id)}
                  onChange={() => handleUserToggle(user._id)}
                />
                <div style={styles.userInfo}>
                  <div style={styles.userDetail}>
                    <div style={styles.userName}>{user.name}</div>
                    <div style={styles.userEmail}>{user.email}</div>
                  </div>
                  <div style={styles.userDetail}>
                    <div><strong>Role:</strong> {user.role}</div>
                    <div><strong>Dept:</strong> {user.department || 'N/A'}</div>
                  </div>
                  <div style={styles.userDetail}>
                    <strong>Position:</strong><br />
                    {user.position || 'N/A'}
                  </div>
                  <div style={styles.userDetail}>
                    <strong>Experience:</strong><br />
                    {user.experience} years
                  </div>
                  <div style={styles.userDetail}>
                    <strong>Skills:</strong><br />
                    <div style={styles.skillsList}>
                      {user.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} style={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                      {user.skills.length > 3 && (
                        <span style={styles.skillTag}>+{user.skills.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            style={styles.confirmButton}
            onClick={handleConfirm}
            disabled={saving}
          >
            {saving ? 'Saving...' : `Confirm Assignment (${selectedUsers.size} users)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSelection;
