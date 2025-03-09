import { useEffect, useState } from "react";
import "./frontend/dashboardStyles.css";

const handleLogout = () => {
  localStorage.removeItem("role");
  window.location.href = "/";
};

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="hero">
        <h2>Hi There Admin</h2>
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
          <h3>Administrative Tools</h3>
          <div className="apps-buttons">
            <button onClick={() => (window.location.href = "/courses")} className="app-button">
              Course Management
            </button>
            <button onClick={() => (window.location.href = "/editGrades")} className="app-button">
              Grade Management
            </button>
            <button onClick={() => (window.location.href = "/studentSearch")} className="app-button">
              Student Search
            </button>
            <button onClick={() => (window.location.href = "/studentRanking")} className="app-button">
              Student Rankings
            </button>
            <button onClick={() => (window.location.href = "/studentProfileInput")} className="app-button">
              Student Export
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

const StudentDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="hero">
        <h2>Welcome, Student!</h2>
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
            <h3>Academic Status</h3>
            <p>Current GPA: 3.5</p>
            <p>Credits Completed: 45</p>
            <p>Credits Remaining: 75</p>
          </div>
          <div className="card">
            <h3>Upcoming Deadlines</h3>
            <p>Course Registration: March 15</p>
            <p>Payment Due: March 20</p>
            <p>Final Exams: April 10</p>
          </div>
        </div>

        <div className="apps-card">
          <h3>Quick Actions</h3>
          <div className="apps-buttons">
            <button onClick={() => (window.location.href = "/academicdashboard")} className="app-button">
              Academic Dashboard
            </button>
            <button onClick={() => (window.location.href = "/courses")} className="app-button">
              Course Registration
            </button>
            <button onClick={() => (window.location.href = "/finances")} className="app-button">
              Financial Information
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (!role) {
      window.location.href = "/";
    } else {
      setUserRole(role);
    }
  }, []);

  if (!userRole) {
    return <div>Loading...</div>;
  }else {
    return userRole === "admin" ? <AdminDashboard /> : <StudentDashboard />;
  }
};

export default Dashboard;
