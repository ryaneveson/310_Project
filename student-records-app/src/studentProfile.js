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
    //Id used for switching profiles
    const [newStudentID, setNewStudentID] = useState("");


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
            window.location.href = "/studentProfileInput";
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

    //use the top-right button to switch to a different student profile
    const switchProfile = () => {
        if (newStudentID.trim()) {
            window.location.href = `/studentProfile/${encodeURIComponent(newStudentID)}`;
        } else {
            alert("Please enter a student ID.");
        }
    };


    //methods to create the html for the student profile
    function PersonalInfo({ studentData, edit, handleInputChange }) {
        return (
            <section id="personal-info">
                <h2>Personal Information</h2>
                <table>
                    <tbody>
                        {[
                            { label: "First Name", field: "first_name" },
                            { label: "Last Name", field: "last_name" },
                            {label: "Student ID", field: "student_id"},
                            { label: "Email", field: "email" },
                            { label: "Gender", field: "gender" },
                            { label: "Degree", field: "degree" },
                            { label: "Major", field: "major" },
                        ].map(({ label, field }) => (
                            <tr key={field}>
                                <td><strong>{label}:</strong></td>
                                <td id={field}>
                                    {edit ? (
                                        <input
                                            value={studentData[field]}
                                            onChange={(e) => handleInputChange(field, e.target.value)}
                                        />
                                    ) : (
                                        studentData[field]
                                    )}
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td><strong>GPA:</strong></td>
                            <td>{studentData.gpa}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        );
    }

    function RegisteredCourses({ registeredCourses, registeredCoursesGrades }) {
        return (
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
                        {registeredCourses.map((course, index) => (
                            <tr key={course}>
                                <td>{course}</td>
                                <td>{registeredCoursesGrades[index]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        );
    }

    function CompletedCourses({ completedCourses, completedCoursesGrades }) {
        return (
            <section className="courses-info">
                <h2>Completed Courses</h2>
                {completedCourses.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Course Name</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedCourses.map((course, index) => (
                                <tr key={course}>
                                    <td>{course}</td>
                                    <td>{completedCoursesGrades[index]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>This student has not completed any courses</p>
                )}
            </section>
        );
    }
    

//return
    //display student's profile data
    //display button for switching profile
    return (
        <div style={{ position: "relative" }}>
            <HeaderLoader />
            <h1>Student Profile</h1>
            {loading ? (
                <p>Loading...</p>
            ) : studentData ? (
                <div>
                    <div style={{ position: "absolute" }} className="search-button-container">
                        <input
                            type="text"
                            placeholder="Enter Student ID"
                            value={newStudentID}
                            onChange={(e) => setNewStudentID(e.target.value)}
                            className="profile-search-input"
                        />
                        <button onClick={switchProfile} className="profile-search-button">
                            Search for a Different Student
                        </button>
                    </div>
                    <div id="student-profile">
                        <PersonalInfo studentData={studentData} edit={edit} handleInputChange={handleInputChange} />
                        <br />
                        <button onClick={handleChange}>{edit ? "Set Info" : "Change Info"}</button>
                        <RegisteredCourses
                            registeredCourses={studentData.registered_courses}
                            registeredCoursesGrades={studentData.registered_courses_grades}
                        />
                        <CompletedCourses
                            completedCourses={studentData.completed_courses}
                            completedCoursesGrades={studentData.completed_courses_grades}
                        />
                    </div>
                </div>
            ) : (
                <p>Student not found.</p>
            )}
        </div>
    );


}