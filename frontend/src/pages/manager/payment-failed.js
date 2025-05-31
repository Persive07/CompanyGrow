import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import makeAuthenticatedRequest from '../../utils/api';
const BonusFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      fetchSessionDetails(sessionId);
    } else {
      // Set default failed payment details
      setPaymentDetails({
        employeeName: 'Unknown Employee',
        amount: '$0.00',
        reason: 'Payment session not found',
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }

    // Auto-redirect after 15 seconds (longer than success page)
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 15000);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  const fetchSessionDetails = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await makeAuthenticatedRequest(`/api/bonus/session/${sessionId}`);

      if (response.ok) {
        const sessionData = await response.json();
        setPaymentDetails({
          amount: `$${(sessionData.amount_total / 100).toFixed(2)}`,
          employeeName: sessionData.metadata.employeeName,
          badgeCount: sessionData.metadata.badgeCount,
          sessionId: sessionData.id,
          timestamp: new Date(sessionData.created * 1000).toISOString(),
          status: sessionData.payment_status,
          reason: getFailureReason(sessionData)
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

  const getFailureReason = (sessionData) => {
    if (sessionData.payment_status === 'unpaid') {
      return 'Payment was not completed';
    }
    return 'Payment processing failed';
  };

  const handleRetryPayment = () => {
    // Navigate back to the review page to retry payment
    navigate('/dashboard');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleContactSupport = () => {
    // You can implement support contact logic here
    window.open('mailto:support@yourcompany.com?subject=Bonus Payment Failed', '_blank');
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
    failedCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '3rem',
      textAlign: 'center',
      maxWidth: '500px',
      width: '100%',
      border: '2px solid #fee2e2'
    },
    failedIcon: {
      width: '80px',
      height: '80px',
      backgroundColor: '#e74c3c',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 2rem',
      animation: 'shake 0.6s ease-in-out'
    },
    crossmark: {
      color: 'white',
      fontSize: '2.5rem',
      fontWeight: 'bold'
    },
    title: {
      fontSize: '2rem',
      color: '#e74c3c',
      marginBottom: '1rem',
      fontWeight: '600'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#7f8c8d',
      marginBottom: '2rem',
      lineHeight: '1.5'
    },
    reasonBox: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '2rem'
    },
    reasonTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#dc2626',
      marginBottom: '0.5rem'
    },
    reasonText: {
      fontSize: '0.9rem',
      color: '#991b1b'
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
      color: '#e74c3c',
      fontSize: '1.2rem'
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: '1rem'
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
      minWidth: '140px'
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
      minWidth: '140px'
    },
    tertiaryButton: {
      backgroundColor: '#95a5a6',
      color: 'white',
      border: 'none',
      padding: '10px 24px',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      minWidth: '140px'
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
    },
    helpText: {
      fontSize: '0.9rem',
      color: '#7f8c8d',
      marginTop: '1rem',
      lineHeight: '1.4'
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
        <div style={styles.failedCard}>
          <div style={styles.loadingSpinner}></div>
          <h2 style={styles.title}>Checking Payment Status...</h2>
          <p style={styles.subtitle}>Please wait while we verify the payment details.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.failedCard}>
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
      <div style={styles.failedCard}>
        {/* Failed Icon */}
        <div style={styles.failedIcon}>
          <span style={styles.crossmark}>✕</span>
        </div>

        {/* Title and Subtitle */}
        <h1 style={styles.title}>Payment Failed</h1>
        <p style={styles.subtitle}>
          The bonus payment for {paymentDetails?.employeeName} could not be processed.
        </p>

        {/* Failure Reason */}
        <div style={styles.reasonBox}>
          <div style={styles.reasonTitle}>Why did this happen?</div>
          <div style={styles.reasonText}>
            {paymentDetails?.reason || 'The payment could not be completed. This could be due to insufficient funds, card issues, or network problems.'}
          </div>
        </div>

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
            
            {paymentDetails.badgeCount && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Badges:</span>
                <span style={styles.detailValue}>
                  {paymentDetails.badgeCount} badges
                </span>
              </div>
            )}
            
            {paymentDetails.sessionId && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Session ID:</span>
                <span style={styles.detailValue}>
                  {paymentDetails.sessionId}
                </span>
              </div>
            )}
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Attempted:</span>
              <span style={styles.detailValue}>
                {formatDate(paymentDetails.timestamp)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.buttonContainer}>
          <button
            style={styles.primaryButton}
            onClick={handleRetryPayment}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
          >
            Retry Payment
          </button>
          
          <button
            style={styles.secondaryButton}
            onClick={handleBackToDashboard}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e74c3c';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#e74c3c';
            }}
          >
            Back to Dashboard
          </button>
        </div>

        <button
          style={styles.tertiaryButton}
          onClick={handleContactSupport}
          onMouseOver={(e) => e.target.style.backgroundColor = '#7f8c8d'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#95a5a6'}
        >
          Contact Support
        </button>

        {/* Help Text */}
        <p style={styles.helpText}>
          If you continue to experience issues, please check your payment method or contact our support team for assistance.
        </p>

        {/* Auto-redirect countdown */}
        <p style={styles.countdown}>
          Redirecting to dashboard in 15 seconds...
        </p>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BonusFailed;
