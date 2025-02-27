import React, { useState, useEffect } from "react";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";

function StudentProfileInput() {
    const [htmlContent, setHtmlContent] = useState("");

    useEffect(() => {
        fetch("/studentProfileInput.html")
            .then(response => response.text())
            .then(data => setHtmlContent(data))
            .catch(error => console.error("Error fetching HTML:", error));
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const studentID = event.target.studentID.value;
        window.location.href = `/studentProfile.html?studentID=${studentID}`;
    };

    return (
        <div>
            <HeaderLoader />
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            <form onSubmit={handleSubmit}>
                <label htmlFor="studentID">Student ID: </label>
                <input type="text" id="studentID" name="studentID" required />
                <button type="submit">Submit</button>
            </form>
            <FooterLoader />
        </div>
    );
}

export default StudentProfileInput;


