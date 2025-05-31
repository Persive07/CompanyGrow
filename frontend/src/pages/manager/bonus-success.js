import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import makeAuthenticatedRequest from '../../utils/api';
const BonusSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    console.log('🔍 Session ID from URL:', sessionId);
    if (sessionId) {
      // Fetch session details from your backend
      console.log("yes session id exists");
      fetchSessionDetails(sessionId);
    } else {
      setError('No session ID found');
      setLoading(false);
    }

    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  const fetchSessionDetails = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await makeAuthenticatedRequest(`/api/payment/session/${sessionId}`);

      if (response.ok) {
        const sessionData = await response.json();

         // Approve the badges after successful payment
        if (sessionData.metadata.badgeIds) {
            console.log("badgeapprove ");
            console.log(sessionData.metadata.badgeIds);
            await makeAuthenticatedRequest('/api/payment/approve-badges', {
            method: 'POST',
            body: JSON.stringify({
                employeeId: sessionData.metadata.employeeId,
                badgeIds: JSON.parse(sessionData.metadata.badgeIds)
            })
            });
        }
        setPaymentDetails({
          amount: `$${(sessionData.amount_total / 100).toFixed(2)}`,
          employeeName: sessionData.metadata.employeeName,
          badgeCount: sessionData.metadata.badgeCount,
          transactionId: sessionData.payment_intent,
          timestamp: new Date(sessionData.created * 1000).toISOString(),
          status: sessionData.payment_status
        });
      } else {
        setError('Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      setError('Error loading payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleViewBonusHistory = () => {
    //navigate('/manager/bonus-history');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    },
    successCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '3rem',
      textAlign: 'center',
      maxWidth: '500px',
      width: '100%'
    },
    successIcon: {
      width: '80px',
      height: '80px',
      backgroundColor: '#27ae60',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 2rem',
      animation: 'checkmark 0.6s ease-in-out'
    },
    checkmark: {
      color: 'white',
      fontSize: '2.5rem',
      fontWeight: 'bold'
    },
    title: {
      fontSize: '2rem',
      color: '#2c3e50',
      marginBottom: '1rem',
      fontWeight: '600'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#7f8c8d',
      marginBottom: '2rem',
      lineHeight: '1.5'
    },
    detailsSection: {
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '2rem',
      textAlign: 'left'
    },
    detailsTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.75rem',
      padding: '0.5rem 0',
      borderBottom: '1px solid #ecf0f1'
    },
    detailLabel: {
      fontWeight: '500',
      color: '#34495e'
    },
    detailValue: {
      color: '#2c3e50',
      fontWeight: '600'
    },
    amountHighlight: {
      color: '#27ae60',
      fontSize: '1.2rem'
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    primaryButton: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      minWidth: '150px'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: '#e74c3c',
      border: '2px solid #e74c3c',
      padding: '10px 24px',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '150px'
    },
    countdown: {
      fontSize: '0.9rem',
      color: '#95a5a6',
      marginTop: '1rem'
    },
    loadingSpinner: {
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #e74c3c',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto'
    },
    errorContainer: {
      color: '#e74c3c',
      textAlign: 'center',
      padding: '2rem'
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.loadingSpinner}></div>
          <h2 style={styles.title}>Processing Payment...</h2>
          <p style={styles.subtitle}>Please wait while we verify your payment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.errorContainer}>
            <h2 style={styles.title}>Error</h2>
            <p style={styles.subtitle}>{error}</p>
            <button style={styles.primaryButton} onClick={handleBackToDashboard}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.successCard}>
        {/* Success Icon */}
        <div style={styles.successIcon}>
          <span style={styles.checkmark}>✓</span>
        </div>

        {/* Title and Subtitle */}
        <h1 style={styles.title}>Bonus Payment Successful!</h1>
        <p style={styles.subtitle}>
          The bonus payment for {paymentDetails?.employeeName} has been processed successfully.
        </p>

        {/* Payment Details */}
        {paymentDetails && (
          <div style={styles.detailsSection}>
            <h3 style={styles.detailsTitle}>Payment Details</h3>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Employee:</span>
              <span style={styles.detailValue}>
                {paymentDetails.employeeName}
              </span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Amount:</span>
              <span style={{...styles.detailValue, ...styles.amountHighlight}}>
                {paymentDetails.amount}
              </span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Badges Earned:</span>
              <span style={styles.detailValue}>
                {paymentDetails.badgeCount} badges
              </span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Transaction ID:</span>
              <span style={styles.detailValue}>
                {paymentDetails.transactionId}
              </span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Date & Time:</span>
              <span style={styles.detailValue}>
                {formatDate(paymentDetails.timestamp)}
              </span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Status:</span>
              <span style={{...styles.detailValue, color: '#27ae60'}}>
                {paymentDetails.status}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.buttonContainer}>
          <button
            style={styles.primaryButton}
            onClick={handleBackToDashboard}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
          >
            Back to Dashboard
          </button>
          
          <button
            style={styles.secondaryButton}
            onClick={handleViewBonusHistory}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e74c3c';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#e74c3c';
            }}
          >
            View History
          </button>
        </div>

        {/* Auto-redirect countdown */}
        <p style={styles.countdown}>
          Redirecting to dashboard in 10 seconds...
        </p>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes checkmark {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BonusSuccess;
