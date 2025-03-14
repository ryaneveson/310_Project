import React, { useEffect, useState } from "react";
import "./frontend/dashboardStyles.css";
import ubcoImage from './frontend/img/UBCO6.jpg';
import Calendar from './Calendar';

const handleLogout = () => {
  localStorage.removeItem("role");
  window.location.href = "/";
};

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="campus-image">
        <img src={ubcoImage} alt="UBCO Campus" />
      </div>
      <div className="hero">
        <h2>Hi There Admin</h2>
        <p>
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
          </div>
        </div>
      </div>

    </div>
  );
};

const StudentDashboard = () => {
  const [quote, setQuote] = useState({ content: "", author: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "Student");
    const fetchQuote = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("https://api.quotable.io/random");
        const data = await response.json();
        setQuote(data);
      } catch (error) {
        console.error("Error fetching quote:", error);
        setQuote({ content: "Knowledge is power.", author: "Francis Bacon" }); // Fallback quote
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="campus-image">
        <img src={ubcoImage} alt="UBCO Campus" />
      </div>
      <div className="hero">
        <h2>Welcome, {username}!</h2>
        <div className="date-quote-container">
          <p>
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <span className="separator">|</span>
          {isLoading ? (
            <p className="quote-inline">Loading quote...</p>
          ) : (
            <p className="quote-inline">
              "{quote.content}" — {quote.author}
            </p>
          )}
        </div>
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
              Financial Dashboard
            </button>
            <button onClick={() => (window.location.href = "/calendar")} className="app-button">
              Worklist / Calendar
            </button>
            <button onClick={() => (window.location.href = "https://my.ubc.ca")} className="app-button">
              myUBC
            </button>
          </div>
        </div>
      </div>

      <button 
        className="calendar-toggle"
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
      >
        <span style={{ color: '#004385', fontSize: '18px' }}>
          {isCalendarOpen ? '▶' : '◀ '}
        </span>
      </button>

      <div className={`calendar-panel ${isCalendarOpen ? 'open' : ''}`}>
        <Calendar compact={true} />
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
