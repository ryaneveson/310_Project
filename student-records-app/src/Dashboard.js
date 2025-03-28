import React, { useEffect, useState } from "react";
import "./frontend/dashboardStyles.css";
import ubcoImage from './frontend/img/UBCO4.jpg';
import Calendar from './Calendar';

const handleLogout = () => {
  localStorage.removeItem("role");
  window.location.href = "/";
};

// GPA conversion map based on the provided grade scale
const gradeToGPAMap = new Map([
  [90, 4.33], // 90-100 = 4.33
  [89, 4.30], // 89 = 4.30
  [88, 4.20], // 88 = 4.20
  [87, 4.10], // 87 = 4.10
  [86, 4.00], // 86 = 4.00
  [85, 3.95], // 85 = 3.95
  [84, 3.90], // 84 = 3.90
  [83, 3.85], // 83 = 3.85
  [82, 3.80], // 82 = 3.80
  [81, 3.75], // 81 = 3.75
  [80, 3.70], // 80 = 3.70
  [79, 3.60], // 79 = 3.60
  [78, 3.50], // 78 = 3.50
  [77, 3.40], // 77 = 3.40
  [76, 3.30], // 76 = 3.30
  [75, 3.20], // 75 = 3.20
  [74, 3.10], // 74 = 3.10
  [73, 3.00], // 73 = 3.00
  [72, 2.95], // 72 = 2.95
  [71, 2.90], // 71 = 2.90
  [70, 2.80], // 70 = 2.80
  [69, 2.70], // 69 = 2.70
  [68, 2.65], // 68 = 2.65
  [67, 2.60], // 67 = 2.60
  [66, 2.55], // 66 = 2.55
  [65, 2.50], // 65 = 2.50
  [64, 2.40], // 64 = 2.40
  [63, 2.30], // 63 = 2.30
  [62, 2.20], // 62 = 2.20
  [61, 2.10], // 61 = 2.10
  [60, 2.00], // 60 = 2.00
  [59, 1.90], // 59 = 1.90
  [58, 1.80], // 58 = 1.80
  [57, 1.70], // 57 = 1.70
  [56, 1.60], // 56 = 1.60
  [55, 1.50], // 55 = 1.50
  [54, 1.40], // 54 = 1.40
  [53, 1.30], // 53 = 1.30
  [52, 1.20], // 52 = 1.20
  [51, 1.10], // 51 = 1.10
  [50, 1.00], // 50 = 1.00
]);

const calculateGPA = (grades) => {
  if (!grades || grades.length === 0) return 0;
  
  const averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
  
  if (averageGrade < 50) return 0;
  
  // Find the closest grade in the map
  let closestGrade = [...gradeToGPAMap.keys()].reduce((prev, curr) => {
    return Math.abs(curr - averageGrade) < Math.abs(prev - averageGrade) ? curr : prev;
  });
  
  return gradeToGPAMap.get(closestGrade);
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
            <button onClick={() => (window.location.href = "/studentProfileInput")} className="app-button">
              Student Profile Lookup
            </button>
            <button onClick={() => (window.location.href = "/addFee")} className="app-button">
              AddFee
            </button>
            <button onClick={() => (window.location.href = "/manageStudents")} className="app-button">
              Manage Students
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
  const [academicInfo, setAcademicInfo] = useState({
    gpa: 0,
    creditsCompleted: 0,
    creditsRemaining: 120
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const studentId = localStorage.getItem("student_id");
    setUsername(storedUsername || "Student");

    // Fetch student's academic information
    const fetchAcademicInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/student/studentprofile?student_id=${studentId}`);
        const data = await response.json();
        
        if (data.student) {
          const registeredGrades = data.student.registered_courses_grades.map(Number);
          const completedGrades = data.student.completed_courses_grades.map(Number);
          const allGrades = [...registeredGrades, ...completedGrades];
          
          // Calculate GPA
          const gpa = calculateGPA(allGrades);
          
          // Calculate credits (3 credits per course)
          const completedCredits = data.student.completed_courses.length * 3;
          const remainingCredits = 120 - completedCredits;

          setAcademicInfo({
            gpa: gpa.toFixed(2),
            creditsCompleted: completedCredits,
            creditsRemaining: remainingCredits
          });
        }
      } catch (error) {
        console.error("Error fetching academic info:", error);
      }
    };

    if (studentId) {
      fetchAcademicInfo();
    }

    // Fetch quote (existing code)
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
            <p>GPA: {academicInfo.gpa}</p>
            <p>Credits Completed: {academicInfo.creditsCompleted}</p>
            <p>Credits Remaining: {academicInfo.creditsRemaining}</p>
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
