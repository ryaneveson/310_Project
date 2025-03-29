import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import useUser from "./utils/useUser"; // Import the custom hook
import "./frontend/dashboardStyles.css";

const Finances = () => {
  const { userRole, studentId, handleLogout, handleNavigation } = useUser();
  const [financialInfo, setFinancialInfo] = useState(null);

  const fetchFinancialData = useCallback(async () => {
    if (!studentId) return;

    try {
      await axios.post(`http://localhost:5000/api/update-student-fees?student_id=${studentId}`);

      const [{ data: studentData }, { data: financeData }] = await Promise.all([
        axios.get(`http://localhost:5000/api/student/studentprofile?student_id=${studentId}`),
        axios.get(`http://localhost:5000/api/student/finances?student_id=${studentId}`)
      ]);

      processFinancialData(studentData.student, financeData.finances);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      alert("Error fetching financial information.");
    }
  }, [studentId]);

  const processFinancialData = (student, financeRecords) => {
    let totalFees = 0, totalPaid = 0, remainingBalance = 0;
    let nextDue = null, lastPayment = null, lastPaymentDate = null;

    financeRecords.forEach(item => {
      const itemDate = new Date(item.due_date);

      if (!item.is_paid && (!nextDue || itemDate < new Date(nextDue))) {
        nextDue = itemDate;
      }

      if (item.item_name === "payment") {
        if (!lastPaymentDate || itemDate > new Date(lastPaymentDate)) {
          lastPayment = item.amount;
          lastPaymentDate = itemDate;
        }
        totalPaid += item.amount;
      }else{
        totalFees += item.amount;
      }
    });

    remainingBalance = totalFees - totalPaid;

    setFinancialInfo({
      totalFees,
      amountPaid: totalPaid,
      remainingBalance,
      nextPaymentDue: formatDate(nextDue) || "No upcoming payments",
      lastPayment,
      lastPaymentDate: formatDate(lastPaymentDate) || "No previous payments",
      registeredCourses: student.registered_courses.length
    });
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) : null;
  };

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  if (!userRole) return <div>Loading...</div>;  // Loading state for userRole

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

      {/* Conditional rendering based on financialInfo */}
      {financialInfo ? (
        <div className="dashboard-content">
          <div className="info-cards">
            <FinancialCard title="Account Balance">
              <p>Total Tuition: ${financialInfo.totalFees.toFixed(2)}</p>
              <p>Amount Paid: ${financialInfo.amountPaid.toFixed(2)}</p>
              <p>Remaining Balance: ${financialInfo.remainingBalance.toFixed(2)}</p>
              <p>Registered Courses: {financialInfo.registeredCourses} (${(financialInfo.registeredCourses * 600).toFixed(2)})</p>
              {financialInfo.nextPaymentDue && <p>Next Payment Due: {financialInfo.nextPaymentDue}</p>}
            </FinancialCard>

            <FinancialCard title="Payment History">
              {financialInfo.lastPayment ? (
                <>
                  <p>Last Payment: ${financialInfo.lastPayment.toFixed(2)}</p>
                  <p>Payment Date: {financialInfo.lastPaymentDate}</p>
                </>
              ) : (
                <p>No payment history available</p>
              )}
            </FinancialCard>
          </div>

          <div className="apps-card">
            <h3>Financial Actions</h3>
            <div className="apps-buttons">
              <FinancialActionButton onClick={() => handleNavigation("/makePayment")} label="Make Payment" />
              <FinancialActionButton onClick={() => handleNavigation("/addPaymentMethod")} label="Add Payment Method" />
              <FinancialActionButton onClick={() => handleNavigation("/paymentHistory")} label="View Payment History" />
              <FinancialActionButton onClick={() => handleNavigation("/upcomingDue")} label="View Upcoming Dues" />
            </div>
          </div>
        </div>
      ) : (
        <div>Loading financial data...</div>  // This shows when financial info is not yet available
      )}
    </div>
  );
};

const FinancialCard = ({ title, children }) => (
  <div className="card">
    <h3>{title}</h3>
    {children}
  </div>
);

const FinancialActionButton = ({ onClick, label }) => (
  <button onClick={onClick} className="app-button">
    {label}
  </button>
);

export default Finances;
