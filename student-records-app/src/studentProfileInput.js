import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";

function StudentProfileInput() {
    const [htmlContent, setHtmlContent] = useState("");
    const [studentID, setStudentID] = useState(""); // Add this line
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/studentProfileInput.html")
            .then(response => response.text())
            .then(data => setHtmlContent(data))
            .catch(error => console.error("Error fetching HTML:", error));
    }, []);

    const handleSubmit = () => {
        if (studentID.trim()) {
            navigate(`/studentProfile/${encodeURIComponent(studentID)}`);
        } else {
            alert("Please enter a student ID.");
        }
    };

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


