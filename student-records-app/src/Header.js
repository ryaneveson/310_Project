import React, { useState } from "react";
import "./frontend/header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      <h1>Werkday</h1>
      <button className={`menu-button ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
        <div></div>
        <div></div>
        <div></div>
      </button>
      <ul className={`dropdown-menu ${menuOpen ? "open" : ""}`}>
        <li><a href="/Dashboard">Home</a></li>
        <li><a href="/Finances">Financial Dashboard</a></li>
        <li><a href="/Courses">Courses</a></li>
        <li><a href="/editGrades">Edit Grades</a></li>
      </ul>
    </header>
  );
};

export default Header;
