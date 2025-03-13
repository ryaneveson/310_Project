import React, { useState, useEffect } from "react";
import "./frontend/studentSearch.css";
import { useNavigate } from "react-router-dom";

function StudentSearch() {
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const students = [
        {name: "Alice", lastName: "Johnson", studentNumber: "10000001", gpa: 85, classes: ["Math 101", "History 201", "Science 301", "Art 101", "English 102"]},
        {name: "Bob", lastName: "Smith", studentNumber: "10000002", gpa: 72, classes: ["Math 101", "Biology 201", "Physics 301", "Chemistry 102", "Philosophy 103"]},
        {name: "Charlie", lastName: "Brown", studentNumber: "10000003", gpa: 80, classes: ["Math 101", "History 201", "Economics 101", "Art 101", "English 103"]},
        {name: "David", lastName: "Davis", studentNumber: "10000004", gpa: 75, classes: ["Math 201", "History 101", "Psychology 301", "Music 102", "Biology 103"]},
        {name: "Eva", lastName: "Wilson", studentNumber: "10000005", gpa: 92, classes: ["Chemistry 101", "Math 301", "Physics 101", "Art 101", "Literature 102"]},
        {name: "Frank", lastName: "Miller", studentNumber: "10000006", gpa: 69, classes: ["History 101", "Computer Science 201", "Math 301", "Philosophy 102", "Sociology 103"]},
        {name: "Grace", lastName: "Moore", studentNumber: "10000007", gpa: 78, classes: ["Physics 101", "Biology 102", "Math 101", "History 102", "Psychology 101"]},
        {name: "Hannah", lastName: "Taylor", studentNumber: "10000008", gpa: 76, classes: ["Chemistry 101", "History 103", "Math 101", "Philosophy 104", "Biology 201"]},
        {name: "Isaac", lastName: "Anderson", studentNumber: "10000009", gpa: 87, classes: ["Computer Science 101", "Math 301", "Physics 101", "Art 102", "Literature 103"]},
        {name: "Jack", lastName: "Thomas", studentNumber: "10000010", gpa: 71, classes: ["Music 101", "Math 201", "Biology 102", "Art 101", "Sociology 104"]}
    ];

    const allClasses = [...new Set(students.flatMap(student => student.classes))].sort();

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

    const exportToJson = () => {
        const dataStr = JSON.stringify(filteredStudents, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'students.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
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
                </label>
                <button id="clear-btn" className="btn" data-testid="reset" onClick={clearMax}>Reset</button>
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
                </label>
                <button id="clear-btn" className="btn" data-testid="reset" onClick={clearMin}>Reset</button>
                <br />
                <button id="reset-btn" className="btn" data-testid="reset" onClick={reset}>Reset All</button>
                <button id="toggle-btn" className="btn" onClick={toggleClasses}>
                    {isSidebarVisible ? 'Collapse' : 'Expand'}
                </button>
                <h3>Classes</h3>
                <div className="checkboxes" data-testid="checkboxes" style={{
                    height: isSidebarVisible ? 'auto' : '0',
                    transition: 'width 0.3s ease',
                    overflow: 'hidden'
                }}>
                    {allClasses.map((className) => (
                        <div key={className}>
                            <label>
                                <input
                                    type="checkbox"
                                    data-testid="checkbox"
                                    checked={selectedClasses.has(className)}
                                    onChange={() => handleClassSelection(className)}
                                />
                                {className}
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
                    <button id="export-btn" className="btn" onClick={exportToJson}>Export to JSON</button>
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