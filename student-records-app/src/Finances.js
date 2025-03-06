import { useEffect, useState } from "react";
import "./frontend/dashboardStyles.css";

const Finances = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);
  }, []);

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
            <p>Current Balance: $5,000</p>
            <p>Due Date: March 20, 2024</p>
          </div>
          <div className="card">
            <h3>Payment History</h3>
            <p>Last Payment: $2,000</p>
            <p>Payment Date: February 15, 2024</p>
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
