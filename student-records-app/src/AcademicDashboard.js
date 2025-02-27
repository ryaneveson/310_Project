import { useEffect, useState } from "react";
import "./frontend/dashboardStyles.css"; 

const AcademicDashboard = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    } else {
      setUsername("User");
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

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
            <h3>GPA</h3>
            <p>87%</p>
          </div>
          <div className="card">
            <h3>Course status</h3>
            <p>Courses completed:</p>
            <p>Courses in progress:</p>
            <p>Courses registered:</p>
          </div>
        </div>

        <div className="apps-card">
          <h3>Academic Activities</h3>
          <div className="apps-buttons">
            <button onClick={() => (window.location.href = "/Courses")} className="app-button">
              Course Registration
            </button>
            <button onClick={() => (window.location.href = "/Dashboard")} className="app-button">
              View Grades
            </button>
            <button onClick={() => (window.location.href = "/Dashboard")} className="app-button">
              Transcript Services
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AcademicDashboard;
