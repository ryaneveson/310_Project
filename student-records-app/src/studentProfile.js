import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import HeaderLoader from "./Header";
import "./frontend/studentProfile.css";

export default function StudentProfile() {
    const alertShown = useRef(false);   //keeps track of whether the alert for an invalid id has been shown, keeps the alert from being shown twice

    const [studentData, setStudentData] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);
    const [edit, setEdit] = useState(false);
    const pathParts = window.location.pathname.split("/");
    const studentId = pathParts[pathParts.length - 1];


    useEffect(() => {
        validateStudentId();
        fetchStudentProfile();
    }, []);


//methods
    const handleChange = async () => {
        if(edit){
            let inputError = false;
            if(!studentData.first_name){ showError("first_name", "Can not be empty"); inputError = true;}
            if(!studentData.last_name){ showError("last_name", "Can not be empty"); inputError = true;}
            const emailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]{2,}$/;
            if(!studentData.email || !emailRegex.test(studentData.email)){ showError("email", "Must follow example@example.com"); inputError = true;}
            if(!studentData.gender){ showError("gender", "Can not be empty"); inputError = true;}
            if(!studentData.degree){ showError("degree", "Can not be empty"); inputError = true;}
            if(!studentData.major){ showError("major", "Can not be empty"); inputError = true;}
            if(inputError) return;

            const formData = {
                student_id: studentData.student_id,
                first_name: studentData.first_name,
                last_name: studentData.last_name,
                email: studentData.email,
                gender: studentData.gender,
                degree: studentData.degree,
                major: studentData.major
            };
            fetch("http://localhost:5000/api/edit-student", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
            .then(async (response) => {
                const data = await response.json();
                if (response.ok) {
                    alert('Student updated successfully.');
                    window.location.href=`/studentProfile/${studentId}`;
                } else {
                    alert(`Error adding student1: ${data.error || 'Unknown error'}`);
                }
            })
            .catch((error) => alert(`Error adding student: ${error.message || 'Unknown error'}`));
        }

        setEdit(!edit);
    };

    const showError = (elementId, message) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        let existingError = element.querySelector(".error-message");
        
        if (existingError) {
            existingError.textContent = message;
        } else {
            const error = document.createElement("span");
            error.textContent = message;
            error.className = "error-message";
            element.appendChild(error);
        }
    };
    

    const handleInputChange = (field, value) => {
        setStudentData((prev) => ({
          ...prev,
          [field]: value,
        }));
      };
        //pull student data from database
        const fetchStudentProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/student/studentprofile?student_id=${studentId.trim()}`);
                const studentData = response.data.student;
                const formattedStudent = {
                    student_id: studentData.student_id,
                    first_name: studentData.first_name,
                    last_name: studentData.last_name,
                    email: studentData.email,
                    gender: studentData.gender,
                    registered_courses: studentData.registered_courses,
                    registered_courses_grades: studentData.registered_courses_grades,
                    completed_courses: studentData.completed_courses,
                    completed_courses_grades: studentData.completed_courses_grades,
                    degree: studentData.degree,
                    major: studentData.major,
                    gpa: studentData.gpa.toFixed(1)
                };
                setStudentData(formattedStudent);
                setNotFound(false);
            } catch (err) {
                setNotFound(true);
                if (!alertShown.current) {
                    alert(`Error fetching student profile.${studentId.trim()}.`);
                    alertShown.current = true;
                }
                //window.location.href = "/studentProfileInput";
            }
            alertShown.current = false; // Reset alertShown when student is found
            setLoading(false);
        }

        //validate student ID is retrieved correctly and is the correct length
        const validateStudentId = async () => { 
            if (!studentId || pathParts.length<3) {
                setStudentData(null);
                if(!alertShown.current){
                    alert("Error fetching student profile.");
                    alertShown.current = true;
                }
                window.location.href = "/studentProfileInput";
                return;
            }
            else if (studentId.length !== 8) {
                setStudentData(null);
                if (!alertShown.current) {
                    alert("Invalid student ID.");
                    alertShown.current = true;
                }
                window.location.href = "/studentProfileInput";
                return;
            }
        }
    

//return
    //display student's profile data
    return (
        <div>
            <HeaderLoader />
            <h1>Student Profile</h1>
            {loading ? (
                <p>Loading...</p>
            ) : studentData ? (
                <div>
            {loading ? (
                <p>Loading...</p>
            ) : studentData ? (
                <div id="student-profile">
                    <section id="personal-info">
                        <h2>Personal Information</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <td><strong>First Name:</strong></td>
                                    <td id="first_name">{edit ? (<input value={studentData.first_name} onChange={(e) => handleInputChange("first_name", e.target.value)}></input>) : (studentData.first_name)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Last Name:</strong></td>
                                    <td id="last_name">{edit ? (<input value={studentData.last_name} onChange={(e) => handleInputChange("last_name", e.target.value)}></input>) : (studentData.last_name)}</td>
                                </tr>
                                <tr>
                                    <td><strong>ID:</strong></td>
                                    <td>{studentData.student_id}</td>
                                </tr>
                                <tr>
                                    <td><strong>Email:</strong></td>
                                    <td id="email">{edit ? (<input value={studentData.email} onChange={(e) => handleInputChange("email", e.target.value)}></input>) : (studentData.email)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Gender:</strong></td>
                                    <td id="gender">{edit ? (<input value={studentData.gender} onChange={(e) => handleInputChange("gender", e.target.value)}></input>) : (studentData.gender)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Degree:</strong></td>
                                    <td id="degree">{edit ? (<input value={studentData.degree} onChange={(e) => handleInputChange("degree", e.target.value)}></input>) : (studentData.degree)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Major:</strong></td>
                                    <td id="major">{edit ? (<input value={studentData.major} onChange={(e) => handleInputChange("major", e.target.value)}></input>) : (studentData.major)}</td>
                                </tr>
                                <tr>
                                    <td><strong>GPA:</strong></td>
                                    <td>{studentData.gpa}</td>
                                </tr>
                            </tbody>
                        </table><br></br>
                        {<button onClick={handleChange}>{edit ? "Set Info" : "Change Info"}</button>}
                    </section>
                    <section className="courses-info">
                        <h2>Registered Courses</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Course Name</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentData.registered_courses && studentData.registered_courses.map((course, index) => (
                                    <tr key={course}>
                                        <td>{course}</td>
                                        <td>{studentData.registered_courses_grades[index]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <h2>Completed Courses</h2>
                        {studentData.completed_courses && studentData.completed_courses_grades.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course Name</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentData.completed_courses && studentData.completed_courses.map((course, index) => (
                                        <tr key={course}>
                                            <td>{course}</td>
                                            <td>{studentData.completed_courses_grades[index]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>This student has not completed any courses</p>
                        )}
                    </section>
                </div>
            ) : (
                <p>Student not found.</p>
            )}
        </div>

            ) : (
                <p>Student not found.</p>
            )}
        </div>
    );
}