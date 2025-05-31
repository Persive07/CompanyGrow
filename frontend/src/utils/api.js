// utils/api.js
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  const response = await fetch(`http://localhost:4000${url}`, config);
  
  // Handle token expiration
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  return response;
};

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

export default makeAuthenticatedRequest;
export { apiRequest };