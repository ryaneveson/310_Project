import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./frontend/loginStyles.css";


function VerifyRegistration() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve previously registered courses, default to empty array
  const initialCourses = location.state?.registeredCourses || [];
  const newCourse = location.state?.course ? [location.state] : [];


  const [registeredCourses, setRegisteredCourses] = useState([
    ...initialCourses,
    ...newCourse,
  ]);

// when there are no courses showing, show that tehre are no registerd courses
  if (registeredCourses.length === 0) {
    return (
      <div className="container">
        <h2>No courses registered</h2>
        <button onClick={() => navigate("/courses")} className="auth-button">
          Add Courses
        </button>
      </div>
    );
  }

// remove the course from the list
  const removeCourse = (indexToRemove) => {
    setRegisteredCourses((prevCourses) =>
      prevCourses.filter((_, index) => index !== indexToRemove)
    );
  };
// this does not do anythign yet.
  const proceedToCheckout = () => {
    navigate("/checkout", { state: { registeredCourses } });
  };
// add another course. take you back to course page
  const addMoreCourses = () => {
    navigate("/courses", { state: { registeredCourses } });
  };
// go back to the revious page
  const goBack = () => {
    navigate(-1); 
  };

  return (
    <div className="container">
      <h2>Verify Registration</h2>
      <ul>
        {registeredCourses.map((courseData, index) => (
          <li key={index} className="course-summary">
            <p><strong>Course:</strong> {courseData.course}</p>
            <p><strong>Date:</strong> {courseData.date}</p>
            <p><strong>Professor:</strong> {courseData.professor}</p>
            <p><strong>Room:</strong> {courseData.room}</p>
            <p><strong>Description:</strong> {courseData.description}</p>
            <p><strong>Pre-requisites:</strong> {courseData.prerequisites}</p>
            <button onClick={() => removeCourse(index)} className="remove-button">
              Remove Course
            </button>
          </li>
        ))}
      </ul>

      <div className="button-container">
  <button onClick={proceedToCheckout} className="auth-button">
    Proceed to Checkout
  </button>
  <button onClick={addMoreCourses} className="auth-button">
    Add More Courses
  </button>
  <button onClick={goBack} className="auth-button">
    Go Back
  </button>
</div>

    </div>
  );
}

export default VerifyRegistration;
