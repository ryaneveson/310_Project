import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./frontend/dashboardStyles.css";

const Finances = () => {
  const [userRole, setUserRole] = useState(null);
  const [financialInfo, setFinancialInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("student_id");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);
  }, []);

  const fetchFinancialData = useCallback(async () => {
    if (!studentId) return;

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const processFinancialData = (student, financeRecords) => {
    let totalFees = 0, totalPaid = 0, remainingBalance = 0;
    let nextDue = null, lastPayment = null, lastPaymentDate = null;

    financeRecords.forEach(item => {
      totalFees += item.amount;
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

  if (!userRole) return <div>Loading...</div>;

  if (userRole !== "student") {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>This page is only accessible to students.</p>
        <button className="logout-button" onClick={() => localStorage.removeItem("role") || (window.location.href = "/")}>
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

      {loading ? (
        <div>Loading...</div>
      ) : (
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
              <FinancialActionButton url="/makePayment" label="Make Payment" />
              <FinancialActionButton url="/addPaymentMethod" label="Add Payment Method" />
              <FinancialActionButton url="/paymentHistory" label="View Payment History" />
              <FinancialActionButton url="/upcomingDue" label="View Upcoming Dues" />
            </div>
          </div>
        </div>
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

const FinancialActionButton = ({ url, label }) => (
  <button onClick={() => (window.location.href = url)} className="app-button">
    {label}
  </button>
);

export default Finances;
