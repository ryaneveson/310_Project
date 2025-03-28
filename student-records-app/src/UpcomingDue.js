import { useEffect, useState } from "react";
import { formatPayments, fetchFinances } from "./utils/FinanceUtils"; // Import the utility methods
import "./frontend/financeSummaryStyles.css";

const UpcomingDue = ({ mockDues = null }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState([]);
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
    if (mockDues) {
      const formattedUpcoming = mockDues
        .filter((item) => !(item.item_name === "payment") && new Date(item.due_date) > new Date())
        .map((item) => ({
          name: item.item_name,
          date: new Date(item.due_date).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          amount: item.amount,
        }));
      setUpcoming(formattedUpcoming);
      setLoading(false);
      return;
    }

    if (role !== "student") {
      setLoading(false);
      return;
    }

    const financeData = await fetchFinances(studentId);
    setUpcoming(formatPayments(financeData));
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
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
        <h2>Upcoming Dues</h2>
      </div>
      <div className="summary-container">
        <div className="summary-table" >
          <h3>Upcoming Items</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody data-testid="upcoming-table">
              {upcoming.map((item, index) => (
                <tr key={index}>
                  <td className="summary-name">{item.name}</td>
                  <td className="summary-date">{item.date}</td>
                  <td className="summary-amount">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="apps-card">
          <h3>Financial Actions</h3>
          <div className="apps-buttons">
            <button onClick={() => (window.location.href = "/Finances")} className="app-button">
              Finance Dashboard
            </button>
            <button onClick={() => (window.location.href = "/makePayment")} className="app-button">
              Make Payment
            </button>
            <button onClick={() => (window.location.href = "/addPaymentMethod")} className="app-button">
              Add Payment Method
            </button>
            <button onClick={() => (window.location.href = "/paymentHistory")} className="app-button">
              View Payment History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingDue;
