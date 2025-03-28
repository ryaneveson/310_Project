import { useEffect, useState } from "react";
import axios from "axios";
import "./frontend/financeSummaryStyles.css";

const PaymentHistory = ({mockPayments=null}) => {
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

    if(mockPayments){
      const formattedPayments = mockPayments.filter(item => item.item_name === "payment").map(item => ({
        date: new Date(item.due_date).toLocaleDateString('en-GB', {weekday: 'short', day: '2-digit',  month: 'short', year: 'numeric'}),
        amount: item.amount
      }));
      setPayments(formattedPayments);
      setLoading(false);
      return;
    }

    const fetchFinances = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/student/finances?student_id=${studentId}`);
          const financeData = response.data.finances
          const formattedPayments = financeData.filter(item => item.item_name === "payment").map(item => ({
            date: new Date(item.due_date).toLocaleDateString('en-GB', {weekday: 'short', day: '2-digit',  month: 'short', year: 'numeric'}),
            amount: item.amount
          }));
          setPayments(formattedPayments);
          setLoading(false);
        } catch (err) {
          if (err.response && err.response.data && err.response.data.error) {
            alert(`Error: ${err.response.data.error}`);
          } else {
            alert("Error fetching finances.");
          }
        }
      };
      fetchFinances();
  }, []);

  if(loading){
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
            <button onClick={() => (window.location.href = "/Finances")} className="app-button">
              Finance Dashboard
            </button>
            <button onClick={() => (window.location.href = "/makePayment")} className="app-button">
              Make Payment
            </button>
            <button onClick={() => (window.location.href = "/addPaymentMethod")} className="app-button">
              Add Payment Method
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

export default PaymentHistory;
