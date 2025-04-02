import React, { useState, useEffect } from "react";
import "./frontend/studentSearch.css";
import axios from "axios";
import PageBackground from './components/PageBackground';

function StudentSearch({mockStudents = null}) {
    const [userRole, setUserRole] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [students, setStudents] = useState([]);
    const [allClasses, setAllClasses] = useState([]);
    const [loading, setLoading] = useState(true);

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

        if(mockStudents){
            setStudents(mockStudents);
            const allUniqueClasses = [
                ...new Set(
                    mockStudents
                        .flatMap(student => student.classes)
                        .filter(className => /^[A-Z]{4} [0-9]{3}$/.test(className)) //excludes all courses that dont follow the standard naming convention
                )
            ].sort();
            setAllClasses(allUniqueClasses);
            setLoading(false);
            return;
        }
        console.log(mockStudents);

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

                // Extract unique classes from all students
                const uniqueClasses = [...new Set(
                    formattedStudents
                        .flatMap(student => student.classes)
                        .filter(className => /^[A-Z]{4} [0-9]{3}$/.test(className))
                )].sort();
                setAllClasses(uniqueClasses);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching students:", err);
                alert("Error fetching students");
                setLoading(false);
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

    const exportSelectedToJson = () => {
        const dataStr = JSON.stringify(selectedStudents, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'selected_students.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const exportAllStudentsToJson = () => {
        const dataStr = JSON.stringify(students, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'all_students.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const exportSelectedToPdf = async () => {
        if (selectedStudents.length === 0) {
            alert("Please select at least one student to export");
            return;
        }

        try {
            // Open the PDF in a new tab instead of trying to download it
            const studentIds = selectedStudents.map(s => s.studentNumber).join(",");
            window.open(`http://localhost:5000/api/generate-student-report?student_ids=${studentIds}`, '_blank');
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert("Error generating PDF report");
        }
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <PageBackground>
        <div id="studentSearch">
            <aside className="sidebar2" id="sidebar2">
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
                <div className="checkboxes2" data-testid="checkboxes" style={{
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
                    <button id="export-all-btn" className="btn" onClick={exportAllStudentsToJson}>Export All Students</button>
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
                                        <button className="btn" onClick={() => {
                                            setSelectedStudents(prev => [...prev, student]);
                                        }}>
                                            Select Student
                                        </button>
                                        <button className="btn" onClick={() => window.location.href=`/studentProfile/${encodeURIComponent(student.studentNumber)}`}>
                                            Go to Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </article>
            <article id="search-results">
                {/* ... existing search results code ... */}
            </article>

            <div className="selected-students-card">
                <div className="selected-students-header">
                    <h2>Selected Students</h2>
                    <div className="export-buttons">
                        <button className="btn export-json" onClick={exportSelectedToJson}>
                            Export Selected (JSON)
                        </button>
                        <button className="btn export-pdf" onClick={exportSelectedToPdf}>
                            Export Selected (PDF)
                        </button>
                    </div>
                </div>
                <table className="selected-students-table">
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Student Number</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedStudents.map((student, index) => (
                            <tr key={index}>
                                <td>{student.name}</td>
                                <td>{student.lastName}</td>
                                <td>{student.studentNumber}</td>
                                <td>
                                    <button className="btn remove-student" onClick={() => setSelectedStudents(prev => prev.filter(s => s.studentNumber !== student.studentNumber))}>
                                        Remove Student
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </PageBackground>
    );
}

export default StudentSearch;