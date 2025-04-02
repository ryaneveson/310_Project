import React, { useState, useEffect } from "react";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";
import "./frontend/studentRanking.css";
import axios from "axios";
import PageBackground from './components/PageBackground';

function StudentRanking() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    minGPA: "",
    maxGPA: "",
    course: "",
    major: "",
    year: ""
  });
  
  const [filterOptions, setFilterOptions] = useState({
    courses: new Set(),
    majors: new Set(),
    years: new Set()
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/student");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data.students);
      
      const options = {
        courses: new Set(),
        majors: new Set(),
        years: new Set()
      };
      
      data.students.forEach(student => {
        student.classes.forEach(course => options.courses.add(course));
        if (student.major) options.majors.add(student.major);
        const year = student.studentNumber.substring(0, 4);
        options.years.add(year);
      });
      
      setFilterOptions(options);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!students) return [];
    
    return students.filter(student => {
      // GPA filter
      if (filters.minGPA && student.gpa < parseFloat(filters.minGPA)) return false;
      if (filters.maxGPA && student.gpa > parseFloat(filters.maxGPA)) return false;
      
      // Course filter
      if (filters.course && !student.classes.includes(filters.course)) return false;
      
      // Major filter
      if (filters.major && student.major && student.major !== filters.major) return false;
      
      // Year filter (based on student number)
      if (filters.year && !student.studentNumber.startsWith(filters.year)) return false;
      
      return true;
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      minGPA: "",
      maxGPA: "",
      course: "",
      major: "",
      year: ""
    });
  };

  if (loading) return <div className="loading">Loading student rankings...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const filteredStudents = filterStudents();

  const exportRankingsToPdf = async () => {
    try {
      const studentsToExport = filteredStudents
        .sort((a, b) => b.gpa - a.gpa)
        .map((student, index) => ({
          rank: index + 1,
          studentId: student.studentNumber,
          name: `${student.name} ${student.lastName}`,
          gpa: student.gpa,
          major: student.major || 'Undeclared'
        }));

      if (studentsToExport.length === 0) {
        alert("No students to export");
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/generate-rankings-report',
        { 
          students: studentsToExport,
          filters: {
            minGPA: filters.minGPA || "None",
            maxGPA: filters.maxGPA || "None",
            course: filters.course || "All",
            major: filters.major || "All",
            year: filters.year || "All"
          }
        },
        { 
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {
          const errorData = JSON.parse(reader.result);
          alert(`Error: ${errorData.error}`);
        };
        reader.readAsText(response.data);
        return;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_rankings_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      if (error.response && error.response.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            alert(`Server Error: ${errorData.error}`);
          } catch {
            alert("Error generating PDF report. Please try again later.");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        alert("Error generating PDF report. Please try again later.");
      }
    }
  };

  const formatCourseList = (courses) => {
    if (courses.length <= 3) {
      return courses.join(", ");
    }
    return courses.slice(0, 3).join(", ") + ", ...";
  };

  return (
    <PageBackground>
    <div className="student-ranking2">
      <HeaderLoader />
      
      <div className="ranking-container">
        <div className="filters-section">
          <h2>Filters</h2>
          <div className="filter-group">
            <label>
              Min GPA:
              <input
                type="number"
                name="minGPA"
                value={filters.minGPA}
                onChange={handleFilterChange}
                min="0"
                max="100"
                step="0.1"
              />
            </label>
            
            <label>
              Max GPA:
              <input
                type="number"
                name="maxGPA"
                value={filters.maxGPA}
                onChange={handleFilterChange}
                min="0"
                max="100"
                step="0.1"
              />
            </label>
            
            <label>
              Course:
              <select name="course" value={filters.course} onChange={handleFilterChange}>
                <option value="">All Courses</option>
                {[...filterOptions.courses].map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </label>
            
            <label>
              Major:
              <select name="major" value={filters.major} onChange={handleFilterChange}>
                <option value="">All Majors</option>
                {[...filterOptions.majors].map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </select>
            </label>
            
            <label>
              Year:
              <select name="year" value={filters.year} onChange={handleFilterChange}>
                <option value="">All Years</option>
                {[...filterOptions.years].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            
            <button className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <div className="rankings-table">
          <div className="rankings-header">
            <h2>Student Rankings</h2>
            <button 
              className="export-pdf-button"
              onClick={exportRankingsToPdf}
            >
              Export Rankings (PDF)
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Student ID</th>
                <th>Major</th>
                <th>GPA</th>
                <th>Courses</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents
                .sort((a, b) => b.gpa - a.gpa)
                .map((student, index) => (
                  <tr key={student.studentNumber}>
                    <td>{index + 1}</td>
                    <td>{`${student.name} ${student.lastName}`}</td>
                    <td>{student.studentNumber}</td>
                    <td>{student.major || 'Undeclared'}</td>
                    <td>{student.gpa.toFixed(2)}</td>
                    <td className="courses-cell" title={student.classes.join(", ")}>
                      {formatCourseList(student.classes)}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className="no-results">
              No students match the selected filters
            </div>
          )}
        </div>
      </div>
      
      <FooterLoader />
    </div>
    </PageBackground>
  );
}

export default StudentRanking;