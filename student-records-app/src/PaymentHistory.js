import { useEffect, useState } from "react";
import { formatPayments, fetchFinances } from "./utils/financeUtils";
import useUser from "./utils/useUser";
import "./frontend/financeSummaryStyles.css";

const PaymentHistory = ({ mockPayments = null}) => {
  const { userRole, loading, studentId, handleLogout, setLoading } = useUser();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (userRole) {
      fetchData();
    }
  }, [userRole, studentId]);

  const fetchData = async () => {
    if (mockPayments) {
      setPayments(formatPayments(mockPayments,true));
      setLoading(false);
      return;
    }
    if (userRole !== "student") return;
    const financeData = await fetchFinances(studentId);
    setPayments(formatPayments(financeData,true));
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

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

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  if (loading) {
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
    <div className="summary-page">
      <div className="hero">
        <h2>Payment History</h2>
      </div>
      <div className="summary-container">
        <div className="summary-table">
          <h3>Past Payments</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index}>
                  <td className="summary-date">{payment.date}</td>
                  <td className="summary-amount">${payment.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="apps-card">
          <h3>Financial Actions</h3>
          <div className="apps-buttons">
            <button
              onClick={() => handleNavigation("/Finances")}
              className="app-button"
            >
              Finance Dashboard
            </button>
            <button
              onClick={() => handleNavigation("/makePayment")}
              className="app-button"
            >
              Make Payment
            </button>
            <button
              onClick={() => handleNavigation("/addPaymentMethod")}
              className="app-button"
            >
              Add Payment Method
            </button>
            <button
              onClick={() => handleNavigation("/upcomingDue")}
              className="app-button"
            >
              View Upcoming Dues
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
