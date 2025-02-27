import { useEffect, useState } from "react";
import "./frontend/dashboardStyles.css";

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/";
};

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="hero">
        <h2>Hi There</h2>
        <p>
          It's{" "}
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="dashboard-content">
        <div className="info-cards">
          <div className="card">
            <h3>Awaiting Your Action</h3>
            <p>You're all caught up on your tasks.</p>
          </div>
          <div className="card">
            <h3>Timely Suggestions</h3>
            <p>Here's where you'll get updates on your active items.</p>
          </div>
        </div>

        <div className="apps-card">
          <h3>Your Top Apps</h3>
          <div className="apps-buttons">
            <button onClick={() => (window.location.href = "/Courses")} className="app-button">
              Academics
            </button>
            <button onClick={() => (window.location.href = "/Finances")} className="app-button">
              Finances
            </button>
            <button className="app-button">
              Personal Information
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

const StudentDashboard = () => {
  return (
    <div className="dashboard-container">
      <h2>Hello, Student!</h2>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      window.location.href = "/";
    } else {
      setUserRole(role);
    }
  }, []);

  if (!userRole) {
    return <div>Loading...</div>;
  }

  return userRole === "admin" ? <AdminDashboard /> : <StudentDashboard />;
};

export default Dashboard;
