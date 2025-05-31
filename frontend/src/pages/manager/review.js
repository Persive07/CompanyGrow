import React, { useState, useEffect } from 'react';
import makeAuthenticatedRequest from '../../utils/api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { loadStripe } from '@stripe/stripe-js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Users, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Calendar, 
  Search,
  ArrowLeft,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
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

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51H8JYgKZZ7cLCuyj1hM3h1dpYj8vIqRZnGxGzVYZk6L9RnNuM0xwMczwbbC3ZC2eJX7pYID9LuGKp5gW9Uf0KaNq00o7klA0u5');

const Review = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportingPDF, setExportingPDF] = useState(false);
  
  // Stripe-related states
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const exportEmployeePDF = async () => {
  if (!selectedEmployee || !performanceData) {
    alert('Please select an employee first');
    return;
  }

  setExportingPDF(true);
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    // Only export analytics tabs (excluding badge bonus)
    const analyticsViews = ['overview', 'courses', 'projects'];
    const originalView = selectedView;
    
    for (let i = 0; i < analyticsViews.length; i++) {
      const viewName = analyticsViews[i];
      
      // Switch to the current view
      setSelectedView(viewName);
      
      // Wait for the view to render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Capture the content area (excluding header and navigation)
      const element = document.querySelector('.performance-content');
      
      if (element) {
        // Temporarily remove height restrictions for full capture
        const originalStyle = element.style.cssText;
        element.style.height = 'auto';
        element.style.maxHeight = 'none';
        element.style.overflow = 'visible';
        
        const canvas = await html2canvas(element, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          height: element.scrollHeight,
          width: element.scrollWidth,
          scrollX: 0,
          scrollY: 0
        });

        // Restore original styles
        element.style.cssText = originalStyle;

        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions to fit A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 50) / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        
        // Add new page for subsequent views
        if (i > 0) {
          pdf.addPage();
        }
        
        // Add employee info header on first page
        if (i === 0) {
          pdf.setFontSize(20);
          pdf.setTextColor(102, 126, 234);
          pdf.text('Performance Analytics Report', 10, 20);
          
          pdf.setFontSize(14);
          pdf.setTextColor(31, 41, 55);
          pdf.text(`Employee: ${selectedEmployee.name}`, 10, 35);
          pdf.text(`Department: ${selectedEmployee.department}`, 10, 45);
          pdf.text(`Position: ${selectedEmployee.position}`, 10, 55);
          
          const currentDate = new Date().toLocaleDateString();
          pdf.setFontSize(10);
          pdf.setTextColor(107, 114, 128);
          pdf.text(`Generated: ${currentDate}`, 10, 65);
          pdf.text(`Period: ${selectedPeriod === 'all' ? 'All Periods' : selectedPeriod}`, 10, 72);
        }
        
        // Add section title
        const yOffset = i === 0 ? 85 : 20;
        pdf.setFontSize(16);
        pdf.setTextColor(102, 126, 234);
        const sectionTitle = `${viewName.charAt(0).toUpperCase() + viewName.slice(1)} Analytics`;
        pdf.text(sectionTitle, 10, yOffset);
        
        // Add the content image
        pdf.addImage(imgData, 'PNG', 10, yOffset + 10, finalWidth, finalHeight);
      }
    }

    // Restore original view
    setSelectedView(originalView);
    
    // Generate filename
    const currentDate = new Date().toISOString().split('T')[0];
    const periodText = selectedPeriod === 'all' ? 'All-Periods' : selectedPeriod;
    const filename = `${selectedEmployee.name.replace(/\s+/g, '-')}-Performance-Report-${periodText}-${currentDate}.pdf`;
    
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  } finally {
    setExportingPDF(false);
  }
};

  const fetchEmployees = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/user/getAllUsers');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      
      // Show only employees (filter out managers and admins)
      const employeeList = data.filter(user => user.role === 'employee');
      
      setEmployees(employeeList);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchEmployeePerformance = async (employeeId) => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`/api/user/getUserPerf/${employeeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      const data = await response.json();
      setPerformanceData(data.performanceMetrics || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    fetchEmployeePerformance(employee._id);
    setSelectedView('overview');
    setSelectedPeriod('all');
    setSelectedBadges([]);
  };

  const handleBackToList = () => {
    setSelectedEmployee(null);
    setPerformanceData(null);
    setSelectedView('overview');
    setSelectedBadges([]);
  };

  // Badge difficulty mapping with bonus values
  const badgeDifficultyMap = {
    'Green': { difficulty: 'Beginner', color: '#10b981', points: 10, bonusValue: 25 },
    'Cyan': { difficulty: 'Intermediate', color: '#06b6d4', points: 20, bonusValue: 50 },
    'Blue': { difficulty: 'Advanced', color: '#3b82f6', points: 30, bonusValue: 75 },
    'Purple': { difficulty: 'Expert', color: '#8b5cf6', points: 40, bonusValue: 100 },
    'Red': { difficulty: 'Master', color: '#ef4444', points: 50, bonusValue: 150 }
  };

  // Process performance data
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
    let allBadges = [];

    metrics.forEach(metric => {
      if (selectedPeriod === 'all' || metric.period === selectedPeriod) {
        // Process badges
        metric.badgesEarned?.forEach(badge => {
          const badgeInfo = {
            ...badge,
            period: metric.period,
            points: badgeDifficultyMap[badge.title]?.points || 0,
            bonusValue: badgeDifficultyMap[badge.title]?.bonusValue || 0,
            id: `${metric.period}-${badge.type}-${badge.title}-${badge.dateEarned}`
          };
          
          allBadges.push(badgeInfo);
          
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

        // Process goals
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

        // Rating trend
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
    allBadges.sort((a, b) => new Date(b.dateEarned) - new Date(a.dateEarned));

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
      ratingTrend,
      allBadges
    };
  };

  // Create time-based chart for specific type
  const createTypeTimeChart = (timeBasedData, type) => {
    const sortedMonths = Object.keys(timeBasedData).sort((a, b) => new Date(a) - new Date(b));
    
    return {
      labels: sortedMonths,
      datasets: [
        {
          label: `${type} Badges`,
          data: sortedMonths.map(month => timeBasedData[month].badges),
          borderColor: type === 'Course' ? '#3498db' : '#e74c3c',
          backgroundColor: type === 'Course' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(231, 76, 60, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: `${type} Points`,
          data: sortedMonths.map(month => timeBasedData[month].points),
          borderColor: type === 'Course' ? '#2980b9' : '#c0392b',
          backgroundColor: type === 'Course' ? 'rgba(41, 128, 185, 0.1)' : 'rgba(192, 57, 43, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Handle badge selection for bonus
  const handleBadgeSelect = (badge) => {
    setSelectedBadges(prev => {
      const isSelected = prev.find(b => b.id === badge.id);
      if (isSelected) {
        return prev.filter(b => b.id !== badge.id);
      } else {
        return [...prev, badge];
      }
    });
  };

  // Calculate total bonus amount
  const calculateTotalBonus = () => {
    return selectedBadges.reduce((total, badge) => total + badge.bonusValue, 0);
  };

  // Handle bonus payment
  const handleBonusPayment = () => {
    if (selectedBadges.length === 0) {
      alert('Please select at least one badge to convert to bonus');
      return;
    }
    
    const totalAmount = calculateTotalBonus();
    setBonusAmount(totalAmount);
    setShowBonusModal(true);
  };

  // Process Stripe payment
  const processPayment = async () => {
    try {
      setPaymentLoading(true);
      const badgeIds = selectedBadges.map(badge => badge.id);
      console.log('🔍 Frontend - Badge IDs being sent:', badgeIds);

      const stripe = await stripePromise;
      
      // Create payment session
      const response = await makeAuthenticatedRequest('/api/payment/create-bonus-session', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: selectedEmployee._id,
          employeeName: selectedEmployee.name,
          badges: selectedBadges,
          badgeIds: badgeIds, 
          totalAmount: bonusAmount,
          managerId: localStorage.getItem('id')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const session = await response.json();
      window.location.href = session.url;
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chart creation functions
  const createTypeSpecificChart = (data, type) => ({
    labels: Object.keys(data).map(label => badgeDifficultyMap[label]?.difficulty || label),
    datasets: [{
      label: `${type} Badges Earned`,
      data: Object.values(data),
      backgroundColor: Object.keys(data).map(label => badgeDifficultyMap[label]?.color || '#gray'),
      borderRadius: 8,
    }]
  });

  const createTypeGoalChart = (goalStats, type) => ({
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [goalStats.completed, goalStats.inProgress, goalStats.pending],
      backgroundColor: type === 'Course' ? 
        ['#27ae60', '#f39c12', '#e74c3c'] : 
        ['#2ecc71', '#e67e22', '#e74c3c'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  });

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

  // Updated styles to match dashboard
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
    
    searchContainer: {
      marginBottom: '24px',
      position: 'relative'
    },
    
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 48px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.3s ease',
      backgroundColor: 'white'
    },
    
    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6b7280'
    },
    
    employeeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '24px'
    },
    
    employeeCard: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    
    employeeCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    },
    
    employeeHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px'
    },
    
    employeeAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#667eea',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      marginRight: '16px',
      flexShrink: 0
    },
    
    employeeInfo: {
      flex: 1
    },
    
    nameAndRole: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '4px'
    },
    
    employeeName: {
      margin: 0,
      color: '#1f2937',
      fontSize: '20px',
      fontWeight: '600'
    },
    
    roleBadge: {
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '12px',
      color: 'white',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    
    employeePosition: {
      margin: '0 0 4px 0',
      color: '#6b7280',
      fontSize: '14px'
    },
    
    employeeDepartment: {
      margin: 0,
      color: '#9ca3af',
      fontSize: '14px',
      fontWeight: '500'
    },
    
    employeeStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    },
    
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    
    statIcon: {
      color: '#667eea'
    },
    
    statContent: {
      flex: 1
    },
    
    statLabel: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    statValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937'
    },
    
    viewButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '16px',
      padding: '12px 16px',
      backgroundColor: '#667eea',
      color: 'white',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'background-color 0.3s ease'
    },
    
    // Performance view styles
    performanceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    
    employeeHeaderInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.3s ease'
    },
    
    selectedEmployeeInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    
    selectedEmployeeName: {
      margin: 0,
      color: '#1f2937',
      fontSize: '24px',
      fontWeight: 'bold'
    },
    
    selectedEmployeeDetails: {
      margin: 0,
      color: '#6b7280',
      fontSize: '16px'
    },
    
    headerControls: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      flexWrap: 'wrap'
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
      textAlign: 'center'
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
    
    summaryTitle: {
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500',
      margin: '0 0 8px 0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    summaryValue: {
      color: '#1f2937',
      fontSize: '32px',
      fontWeight: 'bold',
      margin: '0 0 4px 0'
    },
    
    summarySubtext: {
      color: '#9ca3af',
      fontSize: '14px'
    },
    
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
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
    
    fullWidthChart: {
      marginBottom: '32px'
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
    
    recentBadgesSection: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      marginBottom: '32px'
    },
    
    sectionTitle: {
      color: '#1f2937',
      marginBottom: '16px',
      fontSize: '20px',
      fontWeight: '600'
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
    
    // Bonus-specific styles
    bonusHeader: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      marginBottom: '32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    },
    
    bonusControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    },
    
    selectedInfo: {
      color: '#6b7280',
      fontSize: '16px',
      fontWeight: '500'
    },
    
    bonusButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
    },
    
    bonusButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
      boxShadow: 'none'
    },
    
    badgeSelectionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '24px'
    },
    
    selectableBadgeCard: {
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '2px solid #e5e7eb',
      position: 'relative'
    },
    
    selectedBadgeCard: {
      borderColor: '#10b981',
      backgroundColor: '#f0fdf4',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
    },
    
    badgeCardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '16px'
    },
    
    badgeCardInfo: {
      flex: 1
    },
    
    badgeCardTitle: {
      margin: '0 0 4px 0',
      color: '#1f2937',
      fontSize: '14px',
      fontWeight: '600'
    },
    
    badgeCardDescription: {
      margin: 0,
      color: '#6b7280',
      fontSize: '12px',
      lineHeight: '1.4'
    },
    
    bonusValueContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    },
    
    bonusValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#10b981'
    },
    
    bonusLabel: {
      fontSize: '12px',
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    badgeCardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    },
    
    badgePeriod: {
      color: '#6b7280',
      fontSize: '12px',
      fontWeight: '500'
    },
    
    selectedIndicator: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      backgroundColor: '#10b981',
      color: 'white',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    
    modalTitle: {
      margin: '0 0 24px 0',
      color: '#1f2937',
      fontSize: '24px',
      fontWeight: 'bold'
    },
    
    modalContent: {
      marginBottom: '32px'
    },
    
    selectedBadgesList: {
      marginTop: '16px',
      maxHeight: '200px',
      overflow: 'auto'
    },
    
    modalBadgeItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 0',
      borderBottom: '1px solid #e5e7eb'
    },
    
    modalBadgeIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '10px',
      fontWeight: 'bold'
    },
    
    modalActions: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'flex-end'
    },
    
    cancelButton: {
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500'
    },
    
    confirmButton: {
      backgroundColor: '#6772e5',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'background-color 0.3s ease'
    },
    
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
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
    
    retryButton: {
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      marginTop: '16px'
    },
    
    noDataContainer: {
      textAlign: 'center',
      padding: '64px 32px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      color: '#6b7280'
    },
    
    noResults: {
      textAlign: 'center',
      padding: '48px 32px',
      color: '#6b7280',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    
    noBadgesMessage: {
      textAlign: 'center',
      padding: '48px 32px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '2px dashed #e5e7eb',
      color: '#6b7280'
    },
    pdfExportButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
    minWidth: '160px',
    justifyContent: 'center'
  },

  pdfExportButtonDisabled: {
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

  if (loading && !selectedEmployee) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <h2 style={styles.loadingTitle}>Loading employees...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchEmployees} style={styles.retryButton}>Retry</button>
        </div>
      </div>
    );
  }

  // Employee List View
  if (!selectedEmployee) {
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Performance Review</h1>
          <p style={styles.subtitle}>Review and manage employee performance metrics</p>
        </div>

        <div style={styles.content}>
          {/* Search */}
          <div style={styles.searchContainer}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search employees by name, department, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Employee Grid */}
          <div style={styles.employeeGrid}>
            {filteredEmployees.map((employee) => (
              <div 
                key={employee._id} 
                style={styles.employeeCard}
                onClick={() => handleEmployeeSelect(employee)}
              >
                <div style={styles.employeeHeader}>
                  <div style={styles.employeeAvatar}>
                    {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div style={styles.employeeInfo}>
                    <div style={styles.nameAndRole}>
                      <h3 style={styles.employeeName}>{employee.name}</h3>
                      <span style={{
                        ...styles.roleBadge,
                        backgroundColor: employee.role === 'admin' ? '#ef4444' : 
                                        employee.role === 'manager' ? '#f59e0b' : '#10b981'
                      }}>
                        {employee.role.toUpperCase()}
                      </span>
                    </div>
                    <p style={styles.employeePosition}>{employee.position}</p>
                    <p style={styles.employeeDepartment}>{employee.department}</p>
                  </div>
                </div>
                
                <div style={styles.employeeStats}>
                  <div style={styles.statItem}>
                    <Calendar size={16} style={styles.statIcon} />
                    <div style={styles.statContent}>
                      <div style={styles.statLabel}>Experience</div>
                      <div style={styles.statValue}>{employee.experience} years</div>
                    </div>
                  </div>
                  <div style={styles.statItem}>
                    <Clock size={16} style={styles.statIcon} />
                    <div style={styles.statContent}>
                      <div style={styles.statLabel}>Join Date</div>
                      <div style={styles.statValue}>
                        {new Date(employee.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={styles.viewButton}>
                  <Eye size={16} />
                  View Performance
                </div>
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div style={styles.noResults}>
              <h3>No employees found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Employee Performance View
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

  if (!performanceData || performanceData.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <button onClick={handleBackToList} style={styles.backButton}>
            <ArrowLeft size={16} />
            Back to Employee List
          </button>
          <div style={styles.noDataContainer}>
            <h3>No Performance Data Available</h3>
            <p>{selectedEmployee.name} hasn't completed any performance reviews yet.</p>
          </div>
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
        <h1 style={styles.title}>Performance Analytics</h1>
        <p style={styles.subtitle}>Detailed performance insights and bonus management</p>
      </div>

      <div style={styles.content}>
        {/* Performance Header */}

        <div style={styles.performanceHeader}>
  <div style={styles.employeeHeaderInfo}>
    <button onClick={handleBackToList} style={styles.backButton}>
      <ArrowLeft size={16} />
      Back to Employee List
    </button>
    <div style={styles.selectedEmployeeInfo}>
      <div style={styles.employeeAvatar}>
        {selectedEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
      </div>
      <div>
        <h2 style={styles.selectedEmployeeName}>{selectedEmployee.name}</h2>
        <p style={styles.selectedEmployeeDetails}>
          {selectedEmployee.position} • {selectedEmployee.department}
        </p>
      </div>
    </div>
  </div>
  
  <div style={styles.headerControls}>
    {/* PDF Export Button */}
    <button
      onClick={exportEmployeePDF}
      disabled={exportingPDF}
      style={{
        ...styles.pdfExportButton,
        ...(exportingPDF ? styles.pdfExportButtonDisabled : {})
      }}
    >
      {exportingPDF ? (
        <>
          <div style={styles.spinner}></div>
          Generating PDF...
        </>
      ) : (
        <>
          📄 Export Analytics PDF
        </>
      )}
    </button>
    
    <div style={styles.viewSelector}>
      <button 
        onClick={() => setSelectedView('overview')}
        style={{
          ...styles.viewButton,
          ...(selectedView === 'overview' ? styles.viewButtonActive : {})
        }}
      >
        Overview
      </button>
      <button 
        onClick={() => setSelectedView('badges')}
        style={{
          ...styles.viewButton,
          ...(selectedView === 'badges' ? styles.viewButtonActive : {})
        }}
      >
        Badge Bonus
      </button>
      <button 
        onClick={() => setSelectedView('courses')}
        style={{
          ...styles.viewButton,
          ...(selectedView === 'courses' ? styles.viewButtonActive : {})
        }}
      >
        Courses Analytics
      </button>
      <button 
        onClick={() => setSelectedView('projects')}
        style={{
          ...styles.viewButton,
          ...(selectedView === 'projects' ? styles.viewButtonActive : {})
        }}
      >
        Projects Analytics
      </button>
    </div>

            
            <div style={styles.periodSelector}>
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
        </div>




        {/* Overview View */}
        <div style={styles.content} className="performance-content">
        {selectedView === 'overview' && (
          <>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryIcon}>
                  <TrendingUp size={24} />
                </div>
                <h3 style={styles.summaryTitle}>Course Points</h3>
                <p style={styles.summaryValue}>{processedData.courseStats.totalPoints}</p>
                <span style={styles.summarySubtext}>{processedData.courseStats.totalBadges} badges earned</span>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryIcon}>
                  <Award size={24} />
                </div>
                <h3 style={styles.summaryTitle}>Project Points</h3>
                <p style={styles.summaryValue}>{processedData.projectStats.totalPoints}</p>
                <span style={styles.summarySubtext}>{processedData.projectStats.totalBadges} badges earned</span>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryIcon}>
                  <CheckCircle size={24} />
                </div>
                <h3 style={styles.summaryTitle}>Course Completion</h3>
                <p style={styles.summaryValue}>{processedData.courseStats.completionRate}%</p>
                <span style={styles.summarySubtext}>{processedData.courseStats.goals.completed} of {processedData.courseStats.goals.total} goals</span>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryIcon}>
                  <DollarSign size={24} />
                </div>
                <h3 style={styles.summaryTitle}>Total Bonus Value</h3>
                <p style={styles.summaryValue}>${processedData.allBadges.reduce((total, badge) => total + badge.bonusValue, 0)}</p>
                <span style={styles.summarySubtext}>Available for conversion</span>
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

        {/* Courses Analytics View */}
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

        {/* Projects Analytics View */}
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

        {/* Badge Bonus View */}
        {selectedView === 'badges' && (
          <>
            <div style={styles.bonusHeader}>
              <h3 style={styles.typeTitle}>🏆 Convert Badges to Bonus</h3>
              <div style={styles.bonusControls}>
                <div style={styles.selectedInfo}>
                  Selected: {selectedBadges.length} badges • Total: ${calculateTotalBonus()}
                </div>
                <button 
                  onClick={handleBonusPayment}
                  disabled={selectedBadges.length === 0}
                  style={{
                    ...styles.bonusButton,
                    ...(selectedBadges.length === 0 ? styles.bonusButtonDisabled : {})
                  }}
                >
                  <DollarSign size={16} />
                  Process Bonus Payment
                </button>
              </div>
            </div>

            <div style={styles.badgeSelectionGrid}>
              {processedData.allBadges
                .filter(badge => !badge.approved) // Filter out approved badges
                .map((badge, index) => {
                  const isSelected = selectedBadges.find(b => b.id === badge.id);
                  return (
                    <div 
                      key={badge.id || index} 
                      style={{
                        ...styles.selectableBadgeCard,
                        ...(isSelected ? styles.selectedBadgeCard : {})
                      }}
                      onClick={() => handleBadgeSelect(badge)}
                    >
                      <div style={styles.badgeCardHeader}>
                        <div 
                          style={{
                            ...styles.badgeIcon,
                            backgroundColor: badgeDifficultyMap[badge.title]?.color || '#gray'
                          }}
                        >
                          {badge.title}
                        </div>
                        <div style={styles.badgeCardInfo}>
                          <h4 style={styles.badgeCardTitle}>{badge.type.toUpperCase()}</h4>
                          <p style={styles.badgeCardDescription}>{badge.description}</p>
                        </div>
                        <div style={styles.bonusValueContainer}>
                          <span style={styles.bonusValue}>${badge.bonusValue}</span>
                          <span style={styles.bonusLabel}>Bonus</span>
                        </div>
                      </div>
                      <div style={styles.badgeCardFooter}>
                        <span style={styles.badgeDate}>
                          {new Date(badge.dateEarned).toLocaleDateString()}
                        </span>
                        <span style={styles.badgePeriod}>{badge.period}</span>
                      </div>
                      {isSelected && (
                        <div style={styles.selectedIndicator}>✓</div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Add this message when no unapproved badges are available */}
            {processedData.allBadges.filter(badge => !badge.approved).length === 0 && (
              <div style={styles.noBadgesMessage}>
                <h3>No Badges Available for Bonus</h3>
                <p>All earned badges have already been processed for payment.</p>
              </div>
            )}
          </>
        )}
        </div>

        {/* Bonus Payment Modal */}
        {showBonusModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Confirm Bonus Payment</h3>
              <div style={styles.modalContent}>
                <p><strong>Employee:</strong> {selectedEmployee.name}</p>
                <p><strong>Selected Badges:</strong> {selectedBadges.length}</p>
                <p><strong>Total Bonus Amount:</strong> ${bonusAmount}</p>
                
                <div style={styles.selectedBadgesList}>
                  {selectedBadges.map((badge, index) => (
                    <div key={index} style={styles.modalBadgeItem}>
                      <span style={{
                        ...styles.modalBadgeIcon,
                        backgroundColor: badgeDifficultyMap[badge.title]?.color
                      }}>
                        {badge.title}
                      </span>
                      <span>{badge.type} - ${badge.bonusValue}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={styles.modalActions}>
                <button 
                  onClick={() => setShowBonusModal(false)}
                  style={styles.cancelButton}
                  disabled={paymentLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={processPayment}
                  style={styles.confirmButton}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Processing...' : 'Pay with Stripe'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* </div> */}
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

export default Review;
