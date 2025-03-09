import { useEffect, useState } from "react";
import "./frontend/dashboardStyles.css"; 

const AcademicDashboard = () => {
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);
    setUsername("User");
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
        <h2>Academic Dashboard</h2>
        <p>
          Welcome to your academic overview
        </p>
      </div>

      <div className="dashboard-content">
        <div className="info-cards">
          <div className="card">
            <h3>Current Semester</h3>
            <p>Spring 2024</p>
            <p>Full-time Status</p>
            <p>Major: Computer Science</p>
          </div>
          <div className="card">
            <h3>Academic Progress</h3>
            <p>GPA: 3.5</p>
            <p>Credits Completed: 45</p>
            <p>Credits In Progress: 15</p>
          </div>
        </div>

        <div className="apps-card">
          <h3>Academic Resources</h3>
          <div className="apps-buttons">
            <button onClick={() => (window.location.href = "/courses")} className="app-button">
              Course Registration
            </button>

            <button onClick={() => (window.location.href = "/Dashboard")} className="app-button">
              Request Transcript
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AcademicDashboard;
