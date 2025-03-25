import { useEffect, useState } from "react";
import axios from "axios";
import "./frontend/dashboardStyles.css";

const Finances = () => {
  const [userRole, setUserRole] = useState(null);
  const [financialInfo, setFinancialInfo] = useState({
    totalFees: 0,
    amountPaid: 0,
    remainingBalance: 0,
    nextPaymentDue: null,
    lastPayment: null,
    lastPaymentDate: null,
    registeredCourses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const studentId = localStorage.getItem("student_id");
    
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);

    const fetchFinancialData = async () => {
      try {
        // First, update the fees
        await axios.post(`http://localhost:5000/api/update-student-fees?student_id=${studentId}`);

        // Get student profile for fees and payment info
        const studentResponse = await axios.get(`http://localhost:5000/api/student/studentprofile?student_id=${studentId}`);
        const studentData = studentResponse.data.student;

        // Get payment history
        const financeResponse = await axios.get(`http://localhost:5000/api/student/finances?student_id=${studentId}`);
        const financeData = financeResponse.data.finances;

        // Calculate next payment due and last payment
        let nextDue = null;
        let lastPayment = null;
        let lastPaymentDate = null;

        financeData.forEach(item => {
          const itemDate = new Date(item.due_date);
          if (item.is_paid === false && (!nextDue || itemDate < new Date(nextDue))) {
            nextDue = itemDate;
          }
          if (item.item_name === "payment") {
            if (!lastPaymentDate || itemDate > new Date(lastPaymentDate)) {
              lastPayment = item.amount;
              lastPaymentDate = itemDate;
            }
          }
        });

        setFinancialInfo({
          totalFees: studentData.fees || 0,
          amountPaid: studentData.paid || 0,
          remainingBalance: (studentData.fees || 0) - (studentData.paid || 0),
          nextPaymentDue: nextDue ? nextDue.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : 'No upcoming payments',
          lastPayment: lastPayment,
          lastPaymentDate: lastPaymentDate ? lastPaymentDate.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : 'No previous payments',
          registeredCourses: studentData.registered_courses.length
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching financial data:", err);
        alert("Error fetching financial information.");
        setLoading(false);
      }
    };

    if (studentId) {
      fetchFinancialData();
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  if (!userRole) {
    return <div>Loading...</div>;
  }

  if (userRole !== "student") {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>This page is only accessible to students.</p>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="hero">
        <h2>Financial Information</h2>
      </div>
      <div className="dashboard-content">
        <div className="info-cards">
          <div className="card">
            <h3>Account Balance</h3>
            <p>Total Tuition: ${financialInfo.totalFees.toFixed(2)}</p>
            <p>Amount Paid: ${financialInfo.amountPaid.toFixed(2)}</p>
            <p>Remaining Balance: ${financialInfo.remainingBalance.toFixed(2)}</p>
            <p>Registered Courses: {financialInfo.registeredCourses} (${(financialInfo.registeredCourses * 600).toFixed(2)})</p>
            {financialInfo.nextPaymentDue && (
              <p>Next Payment Due: {financialInfo.nextPaymentDue}</p>
            )}
          </div>
          <div className="card">
            <h3>Payment History</h3>
            {financialInfo.lastPayment ? (
              <>
                <p>Last Payment: ${financialInfo.lastPayment.toFixed(2)}</p>
                <p>Payment Date: {financialInfo.lastPaymentDate}</p>
              </>
            ) : (
              <p>No payment history available</p>
            )}
          </div>
        </div>

        <div className="apps-card">
          <h3>Financial Actions</h3>
          <div className="apps-buttons">
            <button 
              onClick={() => (window.location.href = "/makePayment")} 
              className="app-button"
              disabled={financialInfo.remainingBalance <= 0}
            >
              Make Payment
            </button>
            <button onClick={() => (window.location.href = "/addPaymentMethod")} className="app-button">
              Add Payment Method
            </button>
            <button onClick={() => (window.location.href = "/paymentHistory")} className="app-button">
              View Payment History
            </button>
            <button onClick={() => (window.location.href = "/upcomingDue")} className="app-button">
              View Upcoming Dues
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finances;
