import { useEffect, useState } from "react";
import axios from "axios";
import "./frontend/financeSummaryStyles.css";

const PaymentHistory = ({ mockPayments = null }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const studentId = localStorage.getItem("student_id");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);
    fetchData(role);
  }, [studentId]);

  const fetchData = async (role) => {
    if (mockPayments) {
      setPayments(formatPayments(mockPayments));
      setLoading(false);
      return;
    }

    if (role !== "student") {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/student/finances?student_id=${studentId}`
      );
      setPayments(formatPayments(response.data.finances));
      setLoading(false);
    } catch (err) {
      handleFetchError(err);
    }
  };

  const formatPayments = (finances) => {
    return finances
      .filter((item) => item.item_name === "payment")
      .map((item) => ({
        date: new Date(item.due_date).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        amount: item.amount,
      }));
  };

  const handleFetchError = (err) => {
    if (err.response && err.response.data && err.response.data.error) {
      alert(`Error: ${err.response.data.error}`);
    } else {
      alert("Error fetching finances.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
