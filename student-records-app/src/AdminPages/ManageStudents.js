import React, { useState, useEffect } from "react";
import axios from "axios";
import "../frontend/addFee.css";

function ManageStudents({ mockStudents = null }) {
    const [userRole, setUserRole] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [newStudentFirstname, setNewStudentFirstname] = useState(null);
    const [newStudentLastname, setNewStudentLastname] = useState(null);
    const [newStudentEmail, setNewStudentEmail] = useState(null);
    const [newStudentGender, setNewStudentGender] = useState(null);
    const [newStudentOtherGender, setNewStudentOtherGender] = useState(null);
    const [newStudentDegree, setNewStudentDegree] = useState(null);
    const [newStudentMajor, setNewStudentMajor] = useState(null);
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
            return;
        }

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
              setLoading(false);
            } catch (err) {
              alert("error fetching students");
            }
          };
          fetchStudents();
    }, []);

    if(loading){
        return <div>Loading...</div>;
    }

    const handleLogout = () => {
        localStorage.removeItem("role");
        window.location.href = "/";
    };

    const filteredStudents = students.filter(student =>
        searchTerm === "" ||
        `${student.name} ${student.lastName} ${student.studentNumber}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

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

    const handleGenderChange = (e) => {
        setNewStudentGender(e.target.value);
        if (e.target.value !== "Other") {
          setNewStudentOtherGender("");
        }
    };

    const deleteStudents = () => {
        if (selectedStudents.length === 0) {
            alert("No students selected to delete.");
            return;
        }
        const studentIdsToDelete = selectedStudents.map(student => student.studentNumber);
        fetch("http://localhost:5000/api/delete-students", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ studentNumbers: studentIdsToDelete }),
          })
            .then(async (response) => {
              const data = await response.json();
              if (response.ok) {
                alert('Students deleted successfully.');
                window.location.href="/manageStudents";
                setSelectedStudents([]);
              } else {
                alert(`Error deleting students: ${data.error || 'Unknown error'}`);
              }
            })
            .catch((error) => alert(`Error deleting students: ${error.message || 'Unknown error'}`));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newStudentFirstname || !newStudentLastname || !newStudentEmail || (!newStudentGender && !newStudentOtherGender) || !newStudentDegree || !newStudentMajor) {
            alert("All fields are required.");
            return;
        }
        let newGender = newStudentGender;
        if (!newGender || newGender === "Other") {
            newGender = newStudentOtherGender;
        }

        const studentData = {
            firstname: newStudentFirstname,
            lastname: newStudentLastname,
            email: newStudentEmail,
            gender: newGender,
            degree: newStudentDegree,
            major: newStudentMajor
        };
        fetch("http://localhost:5000/api/add-student", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(studentData),
        })
        .then(async (response) => {
            const data = await response.json();
            if (response.ok) {
                alert('Student added successfully.');
                window.location.href="/manageStudents"
            } else {
                alert(`Error adding student1: ${data.error || 'Unknown error'}`);
            }
        })
        .catch((error) => alert(`Error adding student: ${error.message || 'Unknown error'}`));
    };

    return (
        <div id="studentSearch">
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
                    <button className="btn" onClick={() => {const confirmed = window.confirm(`Are you sure you want to delete All students?`); if (!confirmed) return; setSelectedStudents(students); deleteStudents();}}>Delete All Students</button>
                </div>
                <div id="results">
                    <h2>Filtered Students</h2>
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
                                        <button className="btn" onClick={() => setSelectedStudents(prev => [...prev, student])}>
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
            <article id="student-container">
            <form id="new-student-form" onSubmit={handleSubmit}>
                <h2>New Student details</h2><br></br>
                    <label>First Name:
                        <input
                            type="text"
                            placeholder="Students Firstname . . ."
                            id="student-firstname"
                            value={newStudentFirstname}
                            onChange={(e) => setNewStudentFirstname(e.target.value)}
                            className="student-box"
                        />
                    </label>
                    <label>Last Name:
                        <input
                            type="text"
                            placeholder="Students Lastname . . ."
                            value={newStudentLastname}
                            id="student-lastname"
                            onChange={(e) => setNewStudentLastname(e.target.value)}
                            className="student-box"
                        />
                    </label>
                    <label>Email:
                        <input
                            type="text"
                            placeholder="example@gmail.com"
                            value={newStudentEmail}
                            id="student-email"
                            onChange={(e) => setNewStudentEmail(e.target.value)}
                            className="student-box"
                        />
                    </label>
                    <label>Gender:
                        <select id="student-gender" value={newStudentGender} onChange={handleGenderChange} className="student-box">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                            <option value="Other">Other</option>
                        </select>
                        {newStudentGender === "Other" && (
                        <input type="text" id="custom-gender" value={newStudentOtherGender} onChange={(e) => setNewStudentOtherGender(e.target.value)} placeholder="Please specify"/>
                        )}
                    </label>
                    <label>Degree:
                        <input
                            type="text"
                            placeholder="Students Degree . . ."
                            value={newStudentDegree}
                            id="stuent-degree"
                            onChange={(e) => setNewStudentDegree(e.target.value)}
                            className="student-box"
                        />
                    </label>
                    <label>Major:
                        <input
                            type="text"
                            placeholder="Students Major . . ."
                            value={newStudentMajor}
                            id="stuent-major"
                            onChange={(e) => setNewStudentMajor(e.target.value)}
                            className="student-box"
                        />
                    </label>
                    <button id="stuent-submit" type="submit">Submit New Student</button>
                </form>
            </article>
            <article id="delete-students-conatiner">
                <div id="selected-students">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2>Selected Students</h2>
                        <button className="btn" onClick={deleteStudents}>Delete Selected Students</button>
                    </div>
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
                            {selectedStudents.map((student, index) => (
                                <tr key={index}>
                                    <td>{student.name}</td>
                                    <td>{student.lastName}</td>
                                    <td>{student.studentNumber}</td>
                                    <td>
                                        <button className="btn" onClick={() => setSelectedStudents(prev => prev.filter(s => s.studentNumber !== student.studentNumber))}>
                                            Remove Student
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

export default ManageStudents;