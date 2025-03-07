import { useEffect, useState } from "react";
import axios from "axios";
import "./frontend/dashboardStyles.css";

const Finances = () => {
  const [userRole, setUserRole] = useState(null);
  const [curBalance, setCurBalance] = useState(null);
  const [nextDue, setNextDue] = useState(null);
  const [lastPayment, setLastPayment] = useState(null);
  const [lastPayDate, setLastPayDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentId = "10000001"

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);

    const fetchFinances = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/student/finances?student_id=${studentId}`);
        const financeData = response.data.finances
        let sum = 0
        financeData.forEach(item => {
          if (item.is_paid === false) {
            sum += item.amount;
            if (!nextDue || new Date(item.due_date) < new Date(nextDue)) {
              setNextDue(new Date(item.due_date).toLocaleDateString('en-GB', {weekday: 'short', day: '2-digit',  month: 'short', year: 'numeric'}));
            }
          }
          if (item.item_name === "payment") {
            if (!lastPayDate || new Date(item.due_date) > new Date(lastPayDate)) {
              setLastPayment(item.amount);
              setLastPayDate(new Date(item.due_date).toLocaleDateString('en-GB', {weekday: 'short', day: '2-digit',  month: 'short', year: 'numeric'}));
            }
          }
        });
        setCurBalance(sum);
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
    <div className="dashboard-container">
      <div className="hero">
        <h2>Financial Information</h2>
      </div>
      <div className="dashboard-content">
        <div className="info-cards">
          <div className="card">
            <h3>Account Balance</h3>
            <p>Current Balance: ${curBalance}</p>
            <p>Due Date: {nextDue}</p>
          </div>
          <div className="card">
            <h3>Payment History</h3>
            <p>Last Payment: ${lastPayment}</p>
            <p>Payment Date: {lastPayDate}</p>
          </div>
        </div>

        <div className="apps-card">
          <h3>Financial Actions</h3>
          <div className="apps-buttons">
            <button onClick={() => (window.location.href = "/makePayment")} className="app-button">
              Make Payment
            </button>
            <button onClick={() => (window.location.href = "/addPaymentMethod")} className="app-button">
              Add Payment Method
            </button>
            <button className="app-button">
              View Payment History
            </button>
            <button className="app-button">
              View Upcoming Dues
            </button>
          </div>
        </div>
      </div>
      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Finances;
