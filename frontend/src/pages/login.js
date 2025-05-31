import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const loginUser = async (userData) => {
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid server response');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';

    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const res = await loginUser(form);

      console.log("Login response from server:", res);

      // Store token and other user info
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify({
        id: res._id,
        name: res.name,
        email: res.email,
        role: res.role
      }));
      localStorage.setItem('role', res.role);
      localStorage.setItem('name', res.name);
      localStorage.setItem('id', res._id);
      

      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <div className="login-header">
          <div className="login-icon"><LogIn size={32} /></div>
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {errors.general && <div className="error-message">{errors.general}</div>}

        <div className="input-group">
          <label>Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" />
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
              className={errors.email ? 'input error' : 'input'}
            />
          </div>
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isLoading}
              className={errors.password ? 'input error' : 'input'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <button type="button" className="forgot-password">Forgot password?</button>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Signing In...' : (
            <div className="btn-flex">
              <LogIn className="btn-icon" />
              Sign In
            </div>
          )}
        </button>

        <p className="footer">© 2024 Your Company. All rights reserved.</p>
      </form>
    </div>
  );
}