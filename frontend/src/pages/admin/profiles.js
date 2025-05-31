import React, { useEffect, useState } from 'react';
import { User, Award, BarChart2, Loader2 } from 'lucide-react';
import makeAuthenticatedRequest from '../../utils/api';

export default function EmployeeProfiles() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await makeAuthenticatedRequest('/api/user/getAllUsers');
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error('Failed to fetch employee profiles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const startEdit = (emp) => {
    setEditingId(emp._id);
    setEditForm({ ...emp });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };


  const saveChanges = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await makeAuthenticatedRequest(`/api/user/modifyProfile/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      const updated = await res.json();
      setEmployees((prev) => prev.map(emp => emp._id === id ? updated : emp));
      cancelEdit();
    } catch (err) {
      console.error('Error updating employee:', err);
    }
  };

  const styles = {
    container: {
      padding: '32px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'sans-serif'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '24px'
    },
    card: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    name: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '4px'
    },
    info: {
      fontSize: '14px',
      color: '#4b5563'
    },
    progress: {
      backgroundColor: '#e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      height: '12px',
      marginTop: '8px'
    },
    progressFill: (percent) => ({
      width: `${percent}%`,
      height: '100%',
      backgroundColor: '#667eea'
    }),
    badge: {
      display: 'inline-block',
      backgroundColor: '#e0e7ff',
      color: '#3730a3',
      borderRadius: '9999px',
      padding: '4px 8px',
      fontSize: '12px',
      marginRight: '6px',
      marginBottom: '4px'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}><User size={24} /> Employee Profiles</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 className="spin" size={32} />
        </div>
      ) : (
        employees.map(emp => (
          <div key={emp._id} style={styles.card}>
            {editingId === emp._id ? (
              <>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                <input
                  type="number"
                  value={editForm.experience}
                  onChange={(e) => setEditForm({ ...editForm, experience: Number(e.target.value) })}
                />
                <input
                  value={editForm.skills.join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value.split(',').map(s => s.trim()) })}
                />
                <button onClick={() => saveChanges(emp._id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <div style={styles.name}>{emp.name}</div>
                <div style={styles.info}>Email: {emp.email}</div>
                <div style={styles.info}>Experience: {emp.experience} years</div>
                <div style={styles.info}>Skills:</div>
                <div>{emp.skills.map(skill => (
                  <span key={skill} style={styles.badge}>{skill}</span>
                ))}</div>
                <div style={styles.info}>Courses Completed: {(emp.courseProgress || []).filter(c => c.status === 'completed').length}</div>
                <div style={styles.progress}>
                  <div style={styles.progressFill(emp.progress)}></div>
                </div>
                <button onClick={() => startEdit(emp)}>Edit</button>
              </>
            )}
          </div>
        ))
      )}

      <style jsx>{`
        .spin {
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
