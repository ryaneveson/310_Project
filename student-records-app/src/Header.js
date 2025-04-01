import React, { useEffect, useState } from "react";
import "./frontend/header.css";

const DropDown = ({ menuOpen }) => {
  const [userRole, setUserRole] = useState(null); 

  useEffect(() => {
    setUserRole(localStorage.getItem("role"));
  });

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("student_id");
    localStorage.removeItem("username");
    handleNavigation("/");
  };

  const handleNavigation = (destination) => {
    window.location.href = destination;
  };

  if (userRole === "student") {
    return (
      <ul data-testid={`logged-student-${menuOpen ? "open" : "closed"}`} className={`dropdown-menu ${menuOpen ? "open" : ""}`}>
        <li><a href="/Dashboard">Home</a></li>
        <li><a href="/Finances">Financial Dashboard</a></li>
        <li><a href="/academicdashboard">Academic Dashboard</a></li>
        <li><a href="/studentInfo">Personal Information</a></li>
        <li><button onClick={handleLogout} className="logout-menu-item">Logout</button></li>
      </ul>
    );
  } else if (userRole === "admin") {
    return (
      <ul daa-testid={`logged-admin-${menuOpen ? "open" : "closed"}`} className={`dropdown-menu ${menuOpen ? "open" : ""}`}>
        <li><a href="/Dashboard">Home</a></li>
        <li><a href="/courses">Course Management</a></li>
        <li><a href="/editGrades">Grade Management</a></li>
        <li><a href="/studentSearch">Student Search</a></li>
        <li><a href="/studentRanking">Student Ranking</a></li>
        <li><a href="/studentProfileInput">Lookup Student</a></li>
        <li><a href="/addFee">Add Fee</a></li>
        <li><a href="/manageStudents">Manage Students</a></li>
        <li><button onClick={handleLogout} className="logout-menu-item">Logout</button></li>
      </ul>
    );
  } else {
    return (
      <ul data-testid={`logged-out-${menuOpen ? "open" : "closed"}`} className={`dropdown-menu ${menuOpen ? "open" : ""}`}>
        <li><button onClick={() => handleNavigation("/")} className="logout-menu-item">Login</button></li>
      </ul>
    );
  }
};


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      <h1>Werkday</h1>
      <button data-testid="menu-button" className={`menu-button ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
        <div></div>
        <div></div>
        <div></div>
      </button>
      <DropDown menuOpen={menuOpen} />
    </header>
  );
};

export default Header;
