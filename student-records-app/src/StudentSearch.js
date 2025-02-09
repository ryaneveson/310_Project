import React, { useState } from "react";
import "./frontend/studentSearch.css";

function StudentSearch() {
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

    // state to track the selected filter classes
    const [selectedClasses, setSelectedClasses] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState(""); 
    const [maxGpa, setMaxGpa] = useState(100);
    const [minGpa, setMinGpa] = useState(0);

    const updateMaxGpa = (value) => {
        const newMaxGpa = Math.min(100, Math.max(value, minGpa)); // ensure maxGpa is at least minGpa + 1
        setMaxGpa(newMaxGpa);
    };
      
    const updateMinGpa = (value) => {
        const newMinGpa = Math.max(0, Math.min(value, maxGpa)); // ensure minGpa is at most maxGpa - 1
        setMinGpa(newMinGpa);
    };

    // update selected classes when a checkbox is clicked
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

    // filter the students based on selected classes
    const filteredStudents = students.filter(student =>
        selectedClasses.size === 0 ||
        [...selectedClasses].every(className => student.classes.includes(className))
        ).filter(student =>
            // check if searchTerm exists and if the combined name & lastName contains it
            searchTerm === "" ||
            `${student.name} ${student.lastName} ${student.studentNumber}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          ).filter(student =>
            student.gpa <= maxGpa && student.gpa >= minGpa
          );

    // state to manage sidebar visibility
    const [isSidebarVisible, setSidebarVisible] = useState(true);
    // function to toggle the sidebar
    const toggleClasses = () => {
        setSidebarVisible(!isSidebarVisible);
    };

    return (
    <div id="studentSearch" className="container">
        <aside className="sidebar" id="sidebar">
            <label>Maximum Percentage Average:<br /><input
                type="text"
                placeholder="100"
                id="min-gpa"
                value={maxGpa}
                onChange={(e) => updateMaxGpa(e.target.value)}
                className="grade-box"
            /><br /></label>
            <label>Minimum Percentage Average:<br /><input
                type="text"
                placeholder="0"
                id="max-gpa"
                value={minGpa}
                onChange={(e) => updateMinGpa(e.target.value)}
                className="grade-box"
            /><br /></label>
            <button className="toggle-btn" onClick={toggleClasses}>{isSidebarVisible ? 'Collapse' : 'Expand'}</button>
            <h3>Select Classes</h3>
            <div className="checkboxes" style={{
                height: isSidebarVisible ? 'auto' : '0',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
            }}>
                {allClasses.map((className) => (
                    <div key={className}>
                        <label>
                            <input
                                type="checkbox"
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
            <label>Search for a student:<br /><input
                type="text"
                placeholder="Search for a student..."
                value={searchTerm}
                id="search-term"
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-box"
            /><br /></label>
            <h2>Filtered Students:</h2>
            <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Last Name</th>
                            <th>Student Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student, index) => (
                            <tr key={index}>
                                <td>{student.name}</td>
                                <td>{student.lastName}</td>
                                <td>{student.studentNumber}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
        </article>
    </div>
    );
}

export default StudentSearch;