import React, { useState, useEffect } from "react";
import "./frontend/loginStyles.css";


function VerifyRegistration() {


  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const storedCourses = localStorage.getItem("registeredCourses");
    if (storedCourses) {
      setRegisteredCourses(JSON.parse(storedCourses));
    }
  }, []);

// when there are no courses showing, show that tehre are no registerd courses
  if (registeredCourses.length === 0) {
    return (
      <div className="container">
        <h2>No courses registered</h2>
        <button onClick={() => window.location.href = "/courses"} className="auth-button">
          Add Courses
        </button>
      </div>
    );
  }

// remove the course from the list
  const removeCourse = (indexToRemove) => {
    const updatedCourses = registeredCourses.filter((_, index) => index !== indexToRemove);
    setRegisteredCourses(updatedCourses);
    localStorage.setItem("registeredCourses", JSON.stringify(updatedCourses));
  };
// this does not do anythign yet.
  const proceedToCheckout = () => {
    const confirmed = window.confirm("Do you want to register in the selected courses?");
    if(confirmed){
      //in the future this adds the couses to the database.
      setIsRegistered(true);
    }
  };

  if(isRegistered){
    return (
      <div className="container">
        <h2>Successfully registered!</h2>
        <button onClick={() => window.location.href = "/dashboard"} className="auth-button">
          Main Dashboard
        </button>
        <button onClick={() => window.location.href = "/academicdashboard"} className="auth-button">
          Academic Dashboard
        </button>
        <button onClick={() => window.location.href = "/courses"} className="auth-button">
          Add More Courses
        </button>
      </div>
    );
  }

// add another course. take you back to course page
  const addMoreCourses = () => {
    window.location.href = "/courses";
  };
// go back to the revious page
  const goBack = () => {
    if (document.referrer) {
      window.location.href = document.referrer;
  } else {
      window.location.href = "/courses"; //if no page to go back to go back to courses page
  }
  
  };

  return (
    <div className="container">
      <h2>Verify Registration</h2>
      <ul>
        {registeredCourses.map((courseData, index) => (
          <li key={index} className="course-summary">
            <p role="cname"><strong>Course:</strong> {courseData.course}</p>
            <p><strong>Date:</strong> {courseData.date}</p>
            <p><strong>Professor:</strong> {courseData.professor}</p>
            <p><strong>Room:</strong> {courseData.room}</p>
            <p><strong>Description:</strong> {courseData.description}</p>
            <p><strong>Pre-requisites:</strong> {courseData.prerequisites}</p>
            <button role="remove-course" onClick={() => removeCourse(index)} className="auth-button">
              Remove Course
            </button>
          </li>
        ))}
      </ul>

      <div className="button-container"> 
  <button onClick={proceedToCheckout} className="auth-button">
    Finalize Registration
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
