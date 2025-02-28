import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";

function StudentProfileInput() {
    const [htmlContent, setHtmlContent] = useState("");
    const [studentID, setStudentID] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        //append html form the html page
        fetch("/studentProfileInput.html")
            .then(response => response.text())
            .then(data => setHtmlContent(data))
            .catch(error => console.error("Error fetching HTML:", error));
    }, []);

    //function when button is pushed, navigate to the student profile page for given id
    const handleSubmit = () => {
        if (studentID.trim()) {
            //TODO: add code later to check if student exists in database, then navigate if so
            navigate(`/studentProfile/${encodeURIComponent(studentID)}`);
        } else {
            alert("Please enter a student ID.");
        }
    };

    //get student id as an input, pass to function to navigate to student profile
    return (
        <div>
            <HeaderLoader/>
            <h1>Search for a Student Profile</h1>
            <input
                type="text"
                placeholder="Enter Student ID"
                value={studentID}
                onChange={(e) => setStudentID(e.target.value)}
            />
            <button onClick={handleSubmit}>Go to Profile</button>
            <FooterLoader/>
        </div>
    );
}

export default StudentProfileInput;