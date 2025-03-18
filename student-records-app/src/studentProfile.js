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
    const [oldStudent, setOldStudent] = useState(null);
    const pathParts = window.location.pathname.split("/");
    const studentId = pathParts[pathParts.length - 1];


    useEffect(() => {
        validateStudentId();
        fetchStudentProfile();
        setLoading(false);
    }, []);


//methods
    const handleChange = () => {
        if(edit){
            
        }else{
            setOldStudent(studentData);
        }

        setEdit(!edit);
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
                    name: studentData.name,
                    email: studentData.email,
                    gender: studentData.gender,
                    registered_courses: studentData.registered_courses,
                    registered_courses_grades: studentData.registered_courses_grades,
                    degree: studentData.degree,
                    major: studentData.major,
                    gpa: studentData.gpa
                };
                setStudentData(formattedStudent);
            } catch (err) {
                if (!alertShown.current) {
                    alert(`Error fetching student profile.${studentId.trim()}.`);
                    alertShown.current = true;
                }
                //window.location.href = "/studentProfileInput";
            }
            setNotFound(false);
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
    //TODO: add student data for completed courses
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
                    <section className="personal-info">
                        <h2>Personal Information</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <td><strong>Name:</strong></td>
                                    <td>{studentData.name}</td>
                                </tr>
                                <tr>
                                    <td><strong>ID:</strong></td>
                                    <td>{studentData.student_id}</td>
                                </tr>
                                <tr>
                                    <td><strong>Email:</strong></td>
                                    <td>{studentData.email}</td>
                                </tr>
                                <tr>
                                    <td><strong>Gender:</strong></td>
                                    <td>{studentData.gender}</td>
                                </tr>
                                <tr>
                                    <td><strong>Degree:</strong></td>
                                    <td>{studentData.degree}</td>
                                </tr>
                                <tr>
                                    <td><strong>Major:</strong></td>
                                    <td>{studentData.major}</td>
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