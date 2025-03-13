import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderLoader from "./Header";
import "./frontend/studentProfile.css";

export default function StudentProfile() {
    const navigate = useNavigate();
    const alertShown = useRef(false);   //keeps track of whether the alert for an invalid id has been shown, keeps the alert from being shown twice

    const [studentData, setStudentData] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathParts = window.location.pathname.split("/");
    const studentId = pathParts[pathParts.length - 1];


    useEffect(() => {
        //verify that student ID is valid
        if (!studentId || pathParts.length<3) {
            setStudentData(null);
            if(!alertShown.current){
                alert("Error, try again.");
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

        //dummy student data for now
            //TODO: change registered_courses to work with ObjectId from database instead of course name
        const data = [
            { student_id: "10000001", name: "John Jover", email: "johnjover@johnmail.com", gender: "Male", registered_courses: ["Course 1", "Course 2", "Course 3", "Course 4"], registered_courses_grades: [85, 82, 77, 91], degree: "B.Sc.", major: "Computer Science", current_gpa: 83.75 },
        ];

        //find the student, from dummy data for now
        const student = data.find(student => student.student_id);
        setStudentData(student);
        setLoading(false);

        //TODO: pull from database instead of dummy data
            //un-comment when I can get the database connection to work
        /*fetchStudentProfile();*/
    }, []);

        //pull student data from database
        const fetchStudentProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/student/studentprofile?student_id=${studentId}`);
                setStudentData(response.data);
            } catch (err) {
                setStudentData(null);
                if (!alertShown.current) {
                    alert("Error fetching student profile.");
                    alertShown.current = true;
                }
                window.location.href = "/studentProfileInput";
            }

            setNotFound(false);
            alertShown.current = false; // Reset alertShown when student is found
            setLoading(false);
        }
    
    //display student's profile data
    //TODO: add more student data fields later depending on what we want to display
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
                                    <td>{studentData.current_gpa}</td>
                                </tr>
                            </tbody>
                        </table>
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