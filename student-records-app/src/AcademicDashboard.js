import { useEffect, useState } from "react";
import "./frontend/dashboardStyles.css"; 

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

// Constants
const CREDITS_PER_COURSE = 3;
const TOTAL_CREDITS_REQUIRED = 120;

// Custom hooks
const useAcademicInfo = (studentId) => {
  const [academicInfo, setAcademicInfo] = useState({
    gpa: 0,
    creditsCompleted: 0,
    creditsInProgress: 0,
    creditsRemaining: TOTAL_CREDITS_REQUIRED
  });

  useEffect(() => {
    const fetchAcademicInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/student/studentprofile?student_id=${studentId}`);
        const data = await response.json();
        
        if (data.student) {
          const registeredGrades = data.student.registered_courses_grades.map(Number);
          const completedGrades = data.student.completed_courses_grades.map(Number);
          const allGrades = [...registeredGrades, ...completedGrades];
          
          // Calculate GPA using new formula
          const gpa = allGrades.length > 0
            ? calculateGPA(allGrades)
            : 0;
          
          // Calculate credits
          const completedCredits = data.student.completed_courses.length * CREDITS_PER_COURSE;
          const inProgressCredits = data.student.registered_courses.length * CREDITS_PER_COURSE;
          const remainingCredits = TOTAL_CREDITS_REQUIRED - completedCredits;

          setAcademicInfo({
            gpa: gpa.toFixed(2),
            creditsCompleted: completedCredits,
            creditsInProgress: inProgressCredits,
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
  }, [studentId]);

  return academicInfo;
};

// Component for the academic status cards
const AcademicStatusCards = ({ academicInfo }) => (
  <div className="info-cards">
    <div className="card">
      <h3>Current Semester</h3>
      <p>Spring 2024</p>
      <p>Full-time Status</p>
      <p>Credits In Progress: {academicInfo.creditsInProgress}</p>
    </div>
    <div className="card">
      <h3>Academic Progress</h3>
      <p>GPA: {academicInfo.gpa}</p>
      <p>Credits Completed: {academicInfo.creditsCompleted}</p>
      <p>Credits Remaining: {academicInfo.creditsRemaining}</p>
    </div>
  </div>
);

// Component for academic resources
const AcademicResources = ({ onTranscriptDownload }) => (
  <div className="apps-card">
    <h3>Academic Resources</h3>
    <div className="apps-buttons">
      <button onClick={() => (window.location.href = "/courses")} className="app-button">
        Course Registration
      </button>
      <button onClick={onTranscriptDownload} className="app-button">
        Request Transcript
      </button>
    </div>
  </div>
);

const AcademicDashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const studentId = localStorage.getItem("student_id");
  const academicInfo = useAcademicInfo(studentId);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);
  }, []);

  const handleTranscriptDownload = async () => {
    try {
      if (!studentId) {
        alert("Student ID not found. Please log in again.");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/generate-transcript?student_id=${studentId}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to generate transcript');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transcript_${studentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading transcript:', error);
      alert('Failed to download transcript. Please try again.');
    }
  };

  if (!userRole) return <div>Loading...</div>;

  if (userRole !== "student") {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>This page is only accessible to students.</p>
        <button className="logout-button" onClick={() => {
          localStorage.removeItem("role");
          window.location.href = "/";
        }}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="hero">
        <h2>Academic Dashboard</h2>
        <p>Welcome to your academic overview</p>
      </div>

      <div className="dashboard-content">
        <AcademicStatusCards academicInfo={academicInfo} />
        <AcademicResources onTranscriptDownload={handleTranscriptDownload} />
      </div>
    </div>
  );
};

export default AcademicDashboard;
