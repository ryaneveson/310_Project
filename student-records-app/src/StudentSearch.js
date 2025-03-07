import React, { useState, useEffect } from "react";
import axios from "axios";
import "./frontend/studentSearch.css";
import { useNavigate } from "react-router-dom";

function StudentSearch() {
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [allClasses, setAllClasses] = useState([]);
    

    // State management
    const [selectedClasses, setSelectedClasses] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState(""); 
    const [maxGpa, setMaxGpa] = useState(100);
    const [minGpa, setMinGpa] = useState(0);
    const [isSidebarVisible, setSidebarVisible] = useState(true);

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (!role) {
            window.location.href = "/";
            return;
        }
        setUserRole(role);

        const fetchStudents = async () => {
            try {
              const response = await axios.get(`http://localhost:5000/api/student`);
              const studentData = response.data.students;
              const formattedStudents = studentData.map(student => ({
                name: student.name,
                lastName: student.lastName,
                studentNumber: student.studentNumber,
                gpa: student.gpa,
                classes: student.classes
              }));
              setStudents(formattedStudents);

              const allUniqueClasses = [
                ...new Set(
                    formattedStudents
                        .flatMap(student => student.classes)
                        .filter(className => /^[A-Z]{4} [0-9]{3}$/.test(className)) //excludes all courses that dont follow the standard naming convention
                )
            ].sort();
              setAllClasses(allUniqueClasses);
            } catch (err) {
              alert("error");
            }
          };
          fetchStudents();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("role");
        window.location.href = "/";
    };

    const updateMaxGpa = (value) => {
        const newMaxGpa = Math.min(100, Math.max(value, minGpa));
        setMaxGpa(newMaxGpa);
    };
      
    const updateMinGpa = (value) => {
        const newMinGpa = Math.max(0, Math.min(value, maxGpa));
        setMinGpa(newMinGpa);
    };

    const handleClassSelection = (className) => {
        setSelectedClasses((prev) => {
            const newSelectedClasses = new Set(prev);
            if (newSelectedClasses.has(className)) {
                newSelectedClasses.delete(className);
            } else {
                newSelectedClasses.add(className);
            }
            return newSelectedClasses;
        });
    };

    const filteredStudents = students.filter(student =>
        selectedClasses.size === 0 ||
        [...selectedClasses].every(className => student.classes.includes(className))
    ).filter(student =>
        searchTerm === "" ||
        `${student.name} ${student.lastName} ${student.studentNumber}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    ).filter(student =>
        student.gpa <= maxGpa && student.gpa >= minGpa
    );

    const toggleClasses = () => {
        setSidebarVisible(!isSidebarVisible);
    };

    const reset = () => {
        setSelectedClasses(new Set());
    };

    const clearMax = () => {
        setMaxGpa(100);
    };

    const clearMin = () => {
        setMinGpa(0);
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    if (!userRole) {
        return <div>Loading...</div>;
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

    return (
        <div id="studentSearch">
            <aside className="sidebar" id="sidebar">
                <label>Maximum Percentage Average:<br />
                    <input
                        type="text"
                        placeholder="100"
                        id="min-gpa"
                        value={maxGpa}
                        onChange={(e) => updateMaxGpa(e.target.value)}
                        className="grade-box"
                    />
                    <button id="clear-btn" className="btn" data-testid="reset" onClick={clearMax}>Reset</button>
                </label>
                <br />
                <label>Minimum Percentage Average:<br />
                    <input
                        type="text"
                        placeholder="0"
                        id="max-gpa"
                        value={minGpa}
                        onChange={(e) => updateMinGpa(e.target.value)}
                        className="grade-box"
                    />
                    <button id="clear-btn" className="btn" data-testid="reset" onClick={clearMin}>Reset</button>
                </label>
                <br />
                <div className="button-container">
                    <button id="reset-btn" className="btn" data-testid="reset" onClick={reset}>Reset All</button>
                    <button id="toggle-btn" className="btn" onClick={toggleClasses}>
                        {isSidebarVisible ? 'Collapse' : 'Expand'}
                    </button>
                </div>
                <h3>Classes</h3>
                <div className="checkboxes" data-testid="checkboxes" style={{
                    height: isSidebarVisible ? 'auto' : '0',
                    transition: 'width 0.3s ease',
                    overflow: 'hidden'
                }}>
                    {allClasses.map((className) => (
                        <div key={className} >
                            <label>
                                {className}
                                <input
                                    type="checkbox"
                                    data-testid="checkbox"
                                    checked={selectedClasses.has(className)}
                                    onChange={() => handleClassSelection(className)}
                                />
                            </label>
                            <br />
                        </div>
                    ))}
                </div>
            </aside>
            <article>
                <div id="search">
                    <label>Search for a student:<br />
                        <input
                            type="text"
                            placeholder="Search for a student..."
                            value={searchTerm}
                            id="search-term"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-box"
                        />
                    </label>
                    <button id="clear-btn" className="btn" onClick={clearSearch}>Clear</button>
                </div>
                <div id="results">
                    <h2>Filtered Students:</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Student Number</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={index}>
                                    <td>{student.name}</td>
                                    <td>{student.lastName}</td>
                                    <td>{student.studentNumber}</td>
                                    <td>
                                        <button className="btn" onClick={() => navigate(`/studentProfile/${encodeURIComponent(student.studentNumber)}`)}>
                                            Go to Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </article>
        </div>
    );
}

export default StudentSearch;