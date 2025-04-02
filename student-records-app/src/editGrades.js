import React, { useEffect, useState, memo } from "react";
import axios from "axios";
import "./frontend/dashboardStyles.css";
import PageBackground from './components/PageBackground';

// First, modify the StudentSearchForm to be a memoized component at the top of the file
const StudentSearchForm = memo(({ studentId, onStudentIdChange, onSearch }) => {
    const [localStudentId, setLocalStudentId] = useState(studentId);

    useEffect(() => {
        setLocalStudentId(studentId);
    }, [studentId]);

    const handleLocalChange = (e) => {
        setLocalStudentId(e.target.value);
        onStudentIdChange(e);
    };

    return (
        <form onSubmit={onSearch} className="search-container">
            <label htmlFor="student-id">Student ID:</label>
            <input
                type="text"
                id="student-id"
                value={localStudentId}
                onChange={handleLocalChange}
                placeholder="Enter Student ID"
                className="student-id-input"
            />
            <button type="submit" className="search-button">
                Search
            </button>
        </form>
    );
});

// Also create a memoized GradeTable component
const GradeTable = memo(({ title, grades, onGradeChange }) => {
    const [localGrades, setLocalGrades] = useState(grades);

    useEffect(() => {
        setLocalGrades(grades);
    }, [grades]);

    const handleLocalGradeChange = (index, value) => {
        const newGrades = [...localGrades];
        newGrades[index] = { ...newGrades[index], grade: value };
        setLocalGrades(newGrades);
        onGradeChange(index, value);
    };

    return (
        <div className="grades-table-container2">
            <h4>{title}</h4>
            <table className="grades-table2">
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Current Grade</th>
                        <th>New Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {localGrades.map((item, index) => (
                        <tr key={`${title.toLowerCase()}-${index}`}>
                            <td>{item.course}</td>
                            <td>{item.grade || 'N/A'}</td>
                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="grade-input"
                                    value={item.grade}
                                    onChange={(e) => handleLocalGradeChange(index, e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

//function called when "Save Changes: button is clicked, returns"
const EditGrades = () => {
  const [userRole, setUserRole] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [grades, setGrades] = useState({
    registered: [],    // [{course: "COSC 310", grade: "85"}, ...]
    completed: []      // [{course: "COSC 304", grade: "90"}, ...]
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);
  }, []);

  //fetch student data from the server, format it to be displayed in the table
  const fetchStudentData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:5000/api/student/studentprofile?student_id=${studentId}`);
      const { student } = response.data;

      if (!student) {
        setError("Student not found");
        setGrades({ registered: [], completed: [] });
        setStudentName("");
        return;
      }

      setStudentName(`${student.first_name} ${student.last_name}`);
      
      // Format grades data
      const registeredCourses = student.registered_courses.map((course, index) => ({
        course: typeof course === 'string' ? course : course.course_code || 'Unknown Course',
        grade: student.registered_courses_grades[index] || ""
      }));

      const completedCourses = student.completed_courses.map((course, index) => ({
        course: typeof course === 'string' ? course : course.course_code || 'Unknown Course',
        grade: student.completed_courses_grades[index] || ""
      }));

      setGrades({
        registered: registeredCourses,
        completed: completedCourses
      });

    } catch (err) {
      setError(err.response?.data?.error || "Error fetching student data");
      setGrades({ registered: [], completed: [] });
      setStudentName("");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const handleStudentIdChange = (e) => {
    setStudentId(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (studentId) {
      fetchStudentData();
    }
  };

  const handleGradeChange = (courseType, index, newGrade) => {
    setGrades(prev => ({
      ...prev,
      [courseType]: prev[courseType].map((item, i) => 
        i === index ? { ...item, grade: newGrade } : item
      )
    }));
  };

  const saveGrades = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/update-grades', {
        student_id: studentId,
        registered_courses_grades: grades.registered.map(g => g.grade),
        completed_courses_grades: grades.completed.map(g => g.grade)
      });

      alert("Grades updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Error updating grades");
    }
  };

//methods to render html elements
  //render the student search form to search for a student by ID and edit their grades
  const renderRegisteredCourses = () => {
    if (grades.registered.length === 0) return null;
    return (
      <GradeTable
        title="Registered Courses"
        grades={grades.registered}
        onGradeChange={(index, value) => handleGradeChange('registered', index, value)}
      />
    );
  };

  //render the completed courses table
  const renderCompletedCourses = () => {
    if (grades.completed.length === 0) return null;
    return (
      <GradeTable
        title="Completed Courses"
        grades={grades.completed}
        onGradeChange={(index, value) => handleGradeChange('completed', index, value)}
      />
    );
  };

  //if userRole is not admin, display access denied message
  if (!userRole) {
    return <div>This page is only accessible to administrators.</div>;
  }

  if (userRole !== "admin") {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>This page is only accessible to administrators.</p>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

//return
  return (
    <PageBackground>
    <div className="dashboard-container">
      <div className="hero">
        <h2>Grade Management</h2>
        <p>Update and manage student grades</p>
      </div>
      <div className="dashboard-content">
        <div className="grades-section2">
          <div className="student-search2">
            <StudentSearchForm
              studentId={studentId}
              onStudentIdChange={handleStudentIdChange}
              onSearch={handleSearch}
            />
          </div>

          {loading && <div className="loading">Loading student data...</div>}
          {error && <div className="error-message">{error}</div>}

          {studentName && (
            <div className="student-info2">
              <h3>Student: {studentName}</h3>
            </div>
          )}

          {(grades.registered.length > 0 || grades.completed.length > 0) && (
            <div className="grades-tables2">
              {renderRegisteredCourses()}
              {renderCompletedCourses()}
              <div className="actions-container">
                <button onClick={saveGrades} className="save-button">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageBackground>
  );
};


export default EditGrades;