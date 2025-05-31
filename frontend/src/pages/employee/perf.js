import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import makeAuthenticatedRequest from '../../utils/api';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Target, 
  Calendar, 
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Perf = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const exportToPDF = async () => {
    setExportingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const views = ['overview', 'courses', 'projects', 'comparison'];
      const originalView = selectedView;
      
      for (let i = 0; i < views.length; i++) {
        const viewName = views[i];
        
        // Switch to the current view
        setSelectedView(viewName);
        
        // Wait for the view to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Capture the content area
        const element = document.querySelector('.perf-content');
        
        if (element) {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            height: element.scrollHeight,
            width: element.scrollWidth
          });

          const imgData = canvas.toDataURL('image/png');
          
          // Calculate dimensions to fit A4
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const finalWidth = imgWidth * ratio;
          const finalHeight = imgHeight * ratio;
          
          // Center the image
          const x = (pdfWidth - finalWidth) / 2;
          const y = 10;

          // Add new page for subsequent views
          if (i > 0) {
            pdf.addPage();
          }
          
          // Add title for each section
          pdf.setFontSize(16);
          pdf.setTextColor(102, 126, 234);
          pdf.text(`${viewName.charAt(0).toUpperCase() + viewName.slice(1)} Analytics`, x, y);
          
          // Handle multi-page content if needed
          if (finalHeight > pdfHeight - 30) {
            const pageHeight = pdfHeight - 30;
            const totalPages = Math.ceil(finalHeight / pageHeight);
            
            for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
              if (pageIndex > 0) pdf.addPage();
              
              const sourceY = pageIndex * (imgHeight / totalPages);
              const sourceHeight = imgHeight / totalPages;
              
              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = imgWidth;
              pageCanvas.height = sourceHeight;
              const pageCtx = pageCanvas.getContext('2d');
              
              pageCtx.drawImage(
                canvas,
                0, sourceY, imgWidth, sourceHeight,
                0, 0, imgWidth, sourceHeight
              );
              
              const pageImgData = pageCanvas.toDataURL('image/png');
              pdf.addImage(pageImgData, 'PNG', x, y + 10, finalWidth, pageHeight);
            }
          } else {
            pdf.addImage(imgData, 'PNG', x, y + 10, finalWidth, finalHeight);
          }
        }
      }

      // Restore original view
      setSelectedView(originalView);
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const periodText = selectedPeriod === 'all' ? 'All-Periods' : selectedPeriod;
      const filename = `Performance-Analytics-${periodText}-${currentDate}.pdf`;
      
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const userId = localStorage.getItem('id');
      
      if (!userId || userId === 'null' || userId === 'undefined') {
        setError('User not logged in. Please log in to view performance data.');
        setLoading(false);
        return;
      }

      const response = await makeAuthenticatedRequest(`/api/user/getUserPerf/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setPerformanceData(data.performanceMetrics || []);
      setLoading(false);
    } catch (err) {
      setError(`Failed to load performance data: ${err.message}`);
      setLoading(false);
    }
  };


  // Badge difficulty mapping
  const badgeDifficultyMap = {
    'Green': { difficulty: 'Beginner', color: '#10b981', points: 10 },
    'Cyan': { difficulty: 'Intermediate', color: '#06b6d4', points: 20 },
    'Blue': { difficulty: 'Advanced', color: '#3b82f6', points: 30 },
    'Purple': { difficulty: 'Expert', color: '#8b5cf6', points: 40 },
    'Red': { difficulty: 'Master', color: '#ef4444', points: 50 }
  };

  // Separate data processing for courses and projects
  const processSeparatedData = (metrics) => {
    const courseData = { Green: 0, Cyan: 0, Blue: 0, Purple: 0, Red: 0 };
    const projectData = { Green: 0, Cyan: 0, Blue: 0, Purple: 0, Red: 0 };
    
    let courseStats = {
      totalPoints: 0,
      totalBadges: 0,
      goals: { total: 0, completed: 0, inProgress: 0, pending: 0 },
      timeBasedData: {},
      recentBadges: []
    };
    
    let projectStats = {
      totalPoints: 0,
      totalBadges: 0,
      goals: { total: 0, completed: 0, inProgress: 0, pending: 0 },
      timeBasedData: {},
      recentBadges: []
    };
    
    let ratingTrend = [];

    metrics.forEach(metric => {
      if (selectedPeriod === 'all' || metric.period === selectedPeriod) {
        // Process badges separately
        metric.badgesEarned?.forEach(badge => {
          const badgeInfo = {
            ...badge,
            period: metric.period,
            points: badgeDifficultyMap[badge.title]?.points || 0
          };
          
          const month = new Date(badge.dateEarned).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });

          if (badge.type === 'course') {
            courseData[badge.title]++;
            courseStats.totalPoints += badgeDifficultyMap[badge.title]?.points || 0;
            courseStats.totalBadges++;
            courseStats.recentBadges.push(badgeInfo);
            
            if (!courseStats.timeBasedData[month]) {
              courseStats.timeBasedData[month] = { badges: 0, points: 0 };
            }
            courseStats.timeBasedData[month].badges++;
            courseStats.timeBasedData[month].points += badgeDifficultyMap[badge.title]?.points || 0;
          } else if (badge.type === 'project') {
            projectData[badge.title]++;
            projectStats.totalPoints += badgeDifficultyMap[badge.title]?.points || 0;
            projectStats.totalBadges++;
            projectStats.recentBadges.push(badgeInfo);
            
            if (!projectStats.timeBasedData[month]) {
              projectStats.timeBasedData[month] = { badges: 0, points: 0 };
            }
            projectStats.timeBasedData[month].badges++;
            projectStats.timeBasedData[month].points += badgeDifficultyMap[badge.title]?.points || 0;
          }
        });

        // Process goals separately
        metric.goals?.forEach(goal => {
          if (goal.mode === 'Training') {
            courseStats.goals.total++;
            if (goal.status === 'completed') courseStats.goals.completed++;
            else if (goal.status === 'in-progress') courseStats.goals.inProgress++;
            else courseStats.goals.pending++;
          } else if (goal.mode === 'Project') {
            projectStats.goals.total++;
            if (goal.status === 'completed') projectStats.goals.completed++;
            else if (goal.status === 'in-progress') projectStats.goals.inProgress++;
            else projectStats.goals.pending++;
          }
        });

        // Rating trend (common)
        ratingTrend.push({
          period: metric.period,
          rating: metric.rating || 0,
          date: metric.reviewDate || new Date()
        });
      }
    });

    // Sort recent badges
    courseStats.recentBadges.sort((a, b) => new Date(b.dateEarned) - new Date(a.dateEarned));
    projectStats.recentBadges.sort((a, b) => new Date(b.dateEarned) - new Date(a.dateEarned));
    ratingTrend.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate completion rates
    courseStats.completionRate = courseStats.goals.total > 0 ? 
      ((courseStats.goals.completed / courseStats.goals.total) * 100).toFixed(1) : 0;
    projectStats.completionRate = projectStats.goals.total > 0 ? 
      ((projectStats.goals.completed / projectStats.goals.total) * 100).toFixed(1) : 0;

    return {
      courseData,
      projectData,
      courseStats,
      projectStats,
      ratingTrend
    };
  };

  // Create charts for specific type (course or project)
  const createTypeSpecificChart = (data, type) => ({
    labels: Object.keys(data).map(label => badgeDifficultyMap[label]?.difficulty || label),
    datasets: [{
      label: `${type} Badges Earned`,
      data: Object.values(data),
      backgroundColor: Object.keys(data).map(label => badgeDifficultyMap[label]?.color || '#gray'),
      borderRadius: 8,
    }]
  });

  // Create time-based chart for specific type
  const createTypeTimeChart = (timeBasedData, type) => {
    const sortedMonths = Object.keys(timeBasedData).sort((a, b) => new Date(a) - new Date(b));
    
    return {
      labels: sortedMonths,
      datasets: [
        {
          label: `${type} Badges`,
          data: sortedMonths.map(month => timeBasedData[month].badges),
          borderColor: type === 'Course' ? '#667eea' : '#ef4444',
          backgroundColor: type === 'Course' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: `${type} Points`,
          data: sortedMonths.map(month => timeBasedData[month].points),
          borderColor: type === 'Course' ? '#4f46e5' : '#dc2626',
          backgroundColor: type === 'Course' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Goal completion chart for specific type
  const createTypeGoalChart = (goalStats, type) => ({
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [goalStats.completed, goalStats.inProgress, goalStats.pending],
      backgroundColor: type === 'Course' ? 
        ['#10b981', '#f59e0b', '#ef4444'] : 
        ['#059669', '#d97706', '#dc2626'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  });

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }},
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }}}
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true }},
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'top' }},
    scales: {
      x: { display: true, title: { display: true, text: 'Month' }},
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Badges' },min:0,max:50},
      y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Points' }, grid: { drawOnChartArea: false },min:0,max:50}
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
    
    headerControls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    
    viewSelector: {
      display: 'flex',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      padding: '4px'
    },
    
    viewButton: {
      padding: '8px 16px',
      border: 'none',
      backgroundColor: 'transparent',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#6b7280',
      transition: 'all 0.3s ease'
    },
    
    viewButtonActive: {
      backgroundColor: '#667eea',
      color: 'white',
      boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)'
    },
    
    periodSelector: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    
    label: {
      color: '#6b7280',
      fontWeight: '500',
      fontSize: '14px'
    },
    
    select: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      backgroundColor: 'white',
      color: '#1f2937'
    },
    
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    
    summaryCard: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      textAlign: 'center',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    
    summaryIcon: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '48px',
      height: '48px',
      backgroundColor: '#667eea',
      color: 'white',
      borderRadius: '12px',
      margin: '0 auto 16px auto'
    },
    
    summaryValue: {
      color: '#1f2937',
      fontSize: '32px',
      fontWeight: 'bold',
      margin: '0 0 8px 0'
    },
    
    summaryTitle: {
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500',
      margin: '0 0 4px 0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    summarySubtext: {
      color: '#9ca3af',
      fontSize: '12px'
    },
    
    section: {
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
    
    typeHeader: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      marginBottom: '32px'
    },
    
    typeTitle: {
      color: '#1f2937',
      margin: '0 0 16px 0',
      fontSize: '24px',
      fontWeight: '600'
    },
    
    typeStats: {
      display: 'flex',
      gap: '32px',
      flexWrap: 'wrap'
    },
    
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    
    fullWidthChart: {
      marginBottom: '32px'
    },
    
    chartContainer: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    },
    
    chartTitle: {
      color: '#1f2937',
      marginBottom: '16px',
      fontSize: '18px',
      fontWeight: '600'
    },
    
    chartWrapper: {
      height: '300px',
      position: 'relative'
    },
    
    recentBadgesSection: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      marginBottom: '32px'
    },
    
    badgesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px'
    },
    
    badgeCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    
    badgeIcon: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '12px',
      flexShrink: 0
    },
    
    badgeInfo: {
      flex: 1
    },
    
    badgeTitle: {
      margin: '0 0 4px 0',
      color: '#1f2937',
      fontSize: '14px',
      fontWeight: '600'
    },
    
    badgeDescription: {
      margin: '0 0 8px 0',
      color: '#6b7280',
      fontSize: '12px',
      lineHeight: '1.4'
    },
    
    badgeDate: {
      color: '#9ca3af',
      fontSize: '12px',
      marginRight: '16px'
    },
    
    badgePoints: {
      color: '#10b981',
      fontSize: '12px',
      fontWeight: '600'
    },
    
    comparisonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    
    comparisonCard: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    },
    
    comparisonTitle: {
      color: '#1f2937',
      margin: '0 0 16px 0',
      fontSize: '20px',
      fontWeight: '600',
      textAlign: 'center'
    },
    
    comparisonStats: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    
    comparisonStat: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #e5e7eb'
    },
    
    comparisonLabel: {
      color: '#6b7280',
      fontSize: '14px'
    },
    
    comparisonValue: {
      color: '#1f2937',
      fontSize: '16px',
      fontWeight: '600'
    },
    
    legendSection: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    },
    
    legendTitle: {
      color: '#1f2937',
      marginBottom: '16px',
      fontSize: '18px',
      fontWeight: '600'
    },
    
    legendGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px'
    },
    
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    
    legendColor: {
      width: '16px',
      height: '16px',
      borderRadius: '3px'
    },
    
    legendText: {
      color: '#6b7280',
      fontSize: '14px'
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
    
    errorContainer: {
      textAlign: 'center',
      padding: '64px 32px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    
    errorTitle: {
      color: '#ef4444',
      fontSize: '24px',
      marginBottom: '16px'
    },
    
    retryButton: {
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '16px auto 0'
    },
    
    noDataContainer: {
      textAlign: 'center',
      padding: '64px 32px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      color: '#6b7280'
    },
    headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },

  pdfButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
    minWidth: '140px',
    justifyContent: 'center'
  },

  pdfButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },

  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <h2 style={styles.loadingTitle}>Loading performance data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h3 style={styles.errorTitle}>Error Loading Performance Data</h3>
          <p>{error}</p>
          <button onClick={fetchPerformanceData} style={styles.retryButton}>
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!performanceData || performanceData.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.noDataContainer}>
          <h3>No Performance Data Available</h3>
          <p>Complete some courses or projects to see your performance metrics.</p>
        </div>
      </div>
    );
  }

  const processedData = processSeparatedData(performanceData);
  const periods = [...new Set(performanceData.map(metric => metric.period))];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
      
      <div style={styles.headerContent}>
        <div>
          <h1 style={styles.title}>Performance Metrics & Analytics</h1>
          <p style={styles.subtitle}>Track your achievements, progress, and professional growth</p>
        </div>
        
        {/* PDF Export Button */}
        <button
          onClick={exportToPDF}
          disabled={exportingPDF}
          style={{
            ...styles.pdfButton,
            ...(exportingPDF ? styles.pdfButtonDisabled : {})
          }}
        >
          {exportingPDF ? (
            <>
              <div style={styles.spinner}></div>
              Generating PDF...
            </>
          ) : (
            <>
              📄 Export PDF
            </>
          )}
        </button>
      </div>
    </div>

    <div style={styles.content} className="perf-content">
        {/* Header with Navigation */}
        <div style={styles.headerControls}>
          <div style={styles.viewSelector}>
            <button 
              onClick={() => setSelectedView('overview')}
              style={{
                ...styles.viewButton,
                ...(selectedView === 'overview' ? styles.viewButtonActive : {})
              }}
            >
              <Eye size={16} />
              Overview
            </button>
            <button 
              onClick={() => setSelectedView('courses')}
              style={{
                ...styles.viewButton,
                ...(selectedView === 'courses' ? styles.viewButtonActive : {})
              }}
            >
              📚 Courses
            </button>
            <button 
              onClick={() => setSelectedView('projects')}
              style={{
                ...styles.viewButton,
                ...(selectedView === 'projects' ? styles.viewButtonActive : {})
              }}
            >
              🚀 Projects
            </button>
            <button 
              onClick={() => setSelectedView('comparison')}
              style={{
                ...styles.viewButton,
                ...(selectedView === 'comparison' ? styles.viewButtonActive : {})
              }}
            >
              ⚖️ Comparison
            </button>
          </div>
          <div style={styles.periodSelector}>
            <Filter size={16} style={{color: '#6b7280'}} />
            <label htmlFor="period-select" style={styles.label}>Period: </label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Periods</option>
              {periods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Overview Summary Cards */}
        {selectedView === 'overview' && (
          <>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryIcon}>
                  <TrendingUp size={24} />
                </div>
                <div style={styles.summaryValue}>{processedData.courseStats.totalPoints}</div>
                <div style={styles.summaryTitle}>Course Points</div>
                <span style={styles.summarySubtext}>{processedData.courseStats.totalBadges} badges earned</span>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryIcon}>
                  <Award size={24} />
                </div>
                <div style={styles.summaryValue}>{processedData.projectStats.totalPoints}</div>
                <div style={styles.summaryTitle}>Project Points</div>
                <span style={styles.summarySubtext}>{processedData.projectStats.totalBadges} badges earned</span>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryIcon}>
                  <Target size={24} />
                </div>
                <div style={styles.summaryValue}>{processedData.courseStats.completionRate}%</div>
                <div style={styles.summaryTitle}>Course Completion</div>
                <span style={styles.summarySubtext}>{processedData.courseStats.goals.completed} of {processedData.courseStats.goals.total} goals</span>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryIcon}>
                  <BarChart3 size={24} />
                </div>
                <div style={styles.summaryValue}>{processedData.projectStats.completionRate}%</div>
                <div style={styles.summaryTitle}>Project Completion</div>
                <span style={styles.summarySubtext}>{processedData.projectStats.goals.completed} of {processedData.projectStats.goals.total} goals</span>
              </div>
            </div>

            <div style={styles.chartsGrid}>
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Course Badges Overview</h3>
                <div style={styles.chartWrapper}>
                  <Bar
                    data={createTypeSpecificChart(processedData.courseData, 'Course')}
                    options={chartOptions}
                  />
                </div>
              </div>
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Project Badges Overview</h3>
                <div style={styles.chartWrapper}>
                  <Bar
                    data={createTypeSpecificChart(processedData.projectData, 'Project')}
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Courses Analytics */}
        {selectedView === 'courses' && (
          <>
            <div style={styles.typeHeader}>
              <h3 style={styles.typeTitle}>📚 Courses Performance Analytics</h3>
              <div style={styles.typeStats}>
                <span>Total Points: <strong>{processedData.courseStats.totalPoints}</strong></span>
                <span>Total Badges: <strong>{processedData.courseStats.totalBadges}</strong></span>
                <span>Completion Rate: <strong>{processedData.courseStats.completionRate}%</strong></span>
              </div>
            </div>

            <div style={styles.chartsGrid}>
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Course Badges by Difficulty</h3>
                <div style={styles.chartWrapper}>
                  <Bar
                    data={createTypeSpecificChart(processedData.courseData, 'Course')}
                    options={chartOptions}
                  />
                </div>
              </div>
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Course Goal Status</h3>
                <div style={styles.chartWrapper}>
                  <Doughnut
                    data={createTypeGoalChart(processedData.courseStats.goals, 'Course')}
                    options={doughnutOptions}
                  />
                </div>
              </div>
            </div>

            <div style={styles.fullWidthChart}>
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Course Progress Over Time</h3>
                <div style={styles.chartWrapper}>
                  <Line
                    data={createTypeTimeChart(processedData.courseStats.timeBasedData, 'Course')}
                    options={lineChartOptions}
                  />
                </div>
              </div>
            </div>

            <div style={styles.recentBadgesSection}>
              <h3 style={styles.sectionTitle}>Recent Course Achievements</h3>
              <div style={styles.badgesGrid}>
                {processedData.courseStats.recentBadges.slice(0, 5).map((badge, index) => (
                  <div key={index} style={styles.badgeCard}>
                    <div 
                      style={{
                        ...styles.badgeIcon,
                        backgroundColor: badgeDifficultyMap[badge.title]?.color || '#gray'
                      }}
                    >
                      {badge.title}
                    </div>
                    <div style={styles.badgeInfo}>
                      <h4 style={styles.badgeTitle}>COURSE</h4>
                      <p style={styles.badgeDescription}>{badge.description}</p>
                      <span style={styles.badgeDate}>
                        {new Date(badge.dateEarned).toLocaleDateString()}
                      </span>
                      <span style={styles.badgePoints}>
                        +{badgeDifficultyMap[badge.title]?.points || 0} points
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Projects Analytics */}
        {selectedView === 'projects' && (
          <>
            <div style={styles.typeHeader}>
              <h3 style={styles.typeTitle}>🚀 Projects Performance Analytics</h3>
              <div style={styles.typeStats}>
                <span>Total Points: <strong>{processedData.projectStats.totalPoints}</strong></span>
                <span>Total Badges: <strong>{processedData.projectStats.totalBadges}</strong></span>
                <span>Completion Rate: <strong>{processedData.projectStats.completionRate}%</strong></span>
              </div>
            </div>

            <div style={styles.chartsGrid}>
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Project Badges by Difficulty</h3>
                <div style={styles.chartWrapper}>
                  <Bar
                    data={createTypeSpecificChart(processedData.projectData, 'Project')}
                    options={chartOptions}
                  />
                </div>
              </div>
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Project Goal Status</h3>
                <div style={styles.chartWrapper}>
                  <Doughnut
                    data={createTypeGoalChart(processedData.projectStats.goals, 'Project')}
                    options={doughnutOptions}
                  />
                </div>
              </div>
            </div>

            <div style={styles.fullWidthChart}>
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Project Progress Over Time</h3>
                <div style={styles.chartWrapper}>
                  <Line
                    data={createTypeTimeChart(processedData.projectStats.timeBasedData, 'Project')}
                    options={lineChartOptions}
                  />
                </div>
              </div>
            </div>

            <div style={styles.recentBadgesSection}>
              <h3 style={styles.sectionTitle}>Recent Project Achievements</h3>
              <div style={styles.badgesGrid}>
                {processedData.projectStats.recentBadges.slice(0, 5).map((badge, index) => (
                  <div key={index} style={styles.badgeCard}>
                    <div 
                      style={{
                        ...styles.badgeIcon,
                        backgroundColor: badgeDifficultyMap[badge.title]?.color || '#gray'
                      }}
                    >
                      {badge.title}
                    </div>
                    <div style={styles.badgeInfo}>
                      <h4 style={styles.badgeTitle}>PROJECT</h4>
                      <p style={styles.badgeDescription}>{badge.description}</p>
                      <span style={styles.badgeDate}>
                        {new Date(badge.dateEarned).toLocaleDateString()}
                      </span>
                      <span style={styles.badgePoints}>
                        +{badgeDifficultyMap[badge.title]?.points || 0} points
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Comparison View */}
        {selectedView === 'comparison' && (
          <>
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <BarChart3 size={24} style={styles.sectionIcon} />
                <h2 style={styles.sectionTitle}>Courses vs Projects Comparison</h2>
              </div>

              <div style={styles.comparisonGrid}>
                <div style={styles.comparisonCard}>
                  <h4 style={styles.comparisonTitle}>📚 Courses</h4>
                  <div style={styles.comparisonStats}>
                    <div style={styles.comparisonStat}>
                      <span style={styles.comparisonLabel}>Total Points</span>
                      <span style={styles.comparisonValue}>{processedData.courseStats.totalPoints}</span>
                    </div>
                    <div style={styles.comparisonStat}>
                      <span style={styles.comparisonLabel}>Total Badges</span>
                      <span style={styles.comparisonValue}>{processedData.courseStats.totalBadges}</span>
                    </div>
                    <div style={styles.comparisonStat}>
                      <span style={styles.comparisonLabel}>Completion Rate</span>
                      <span style={styles.comparisonValue}>{processedData.courseStats.completionRate}%</span>
                    </div>
                    <div style={styles.comparisonStat}>
                      <span style={styles.comparisonLabel}>Active Goals</span>
                      <span style={styles.comparisonValue}>{processedData.courseStats.goals.inProgress}</span>
                    </div>
                  </div>
                </div>

                <div style={styles.comparisonCard}>
                  <h4 style={styles.comparisonTitle}>🚀 Projects</h4>
                  <div style={styles.comparisonStats}>
                    <div style={styles.comparisonStat}>
                      <span style={styles.comparisonLabel}>Total Points</span>
                      <span style={styles.comparisonValue}>{processedData.projectStats.totalPoints}</span>
                    </div>
                    <div style={styles.comparisonStat}>
                      <span style={styles.comparisonLabel}>Total Badges</span>
                      <span style={styles.comparisonValue}>{processedData.projectStats.totalBadges}</span>
                    </div>
                    <div style={styles.comparisonStat}>
                      <span style={styles.comparisonLabel}>Completion Rate</span>
                      <span style={styles.comparisonValue}>{processedData.projectStats.completionRate}%</span>
                    </div>
                    <div style={styles.comparisonStat}>
                      <span style={styles.comparisonLabel}>Active Goals</span>
                      <span style={styles.comparisonValue}>{processedData.projectStats.goals.inProgress}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.chartsGrid}>
                <div style={styles.chartContainer}>
                  <h3 style={styles.chartTitle}>Badge Distribution Comparison</h3>
                  <div style={styles.chartWrapper}>
                    <Bar
                      data={{
                        labels: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'],
                        datasets: [
                          {
                            label: 'Course Badges',
                            data: Object.values(processedData.courseData),
                            backgroundColor: 'rgba(102, 126, 234, 0.8)',
                            borderColor: '#667eea',
                            borderWidth: 1
                          },
                          {
                            label: 'Project Badges',
                            data: Object.values(processedData.projectData),
                            backgroundColor: 'rgba(239, 68, 68, 0.8)',
                            borderColor: '#ef4444',
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: true, position: 'top' }},
                        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }}}
                      }}
                    />
                  </div>
                </div>

                <div style={styles.chartContainer}>
                  <h3 style={styles.chartTitle}>Points Distribution</h3>
                  <div style={styles.chartWrapper}>
                    <Doughnut
                      data={{
                        labels: ['Course Points', 'Project Points'],
                        datasets: [{
                          data: [processedData.courseStats.totalPoints, processedData.projectStats.totalPoints],
                          backgroundColor: ['#667eea', '#ef4444'],
                          borderWidth: 2,
                          borderColor: '#fff'
                        }]
                      }}
                      options={doughnutOptions}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Difficulty Legend */}
        <div style={styles.legendSection}>
          <h4 style={styles.legendTitle}>Difficulty Levels</h4>
          <div style={styles.legendGrid}>
            {Object.entries(badgeDifficultyMap).map(([badge, info]) => (
              <div key={badge} style={styles.legendItem}>
                <div 
                  style={{
                    ...styles.legendColor,
                    backgroundColor: info.color
                  }}
                ></div>
                <span style={styles.legendText}>
                  {info.difficulty} ({info.points} pts)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
    </div>
  );
};

export default Perf;
