import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Courses from "./Courses"; // Adjust the import path if needed

describe("Courses Component", () => {
  test("renders the component with all courses", () => {
    render(<Courses />);

    // Check if heading is rendered
    expect(screen.getByText("Available Courses")).toBeInTheDocument();

    // Check if all courses are listed
    const courses = [
      "Introduction to Programming",
      "Data Structures",
      "Web Development",
      "Database Management",
      "Machine Learning",
      "Software Engineering",
      "Cybersecurity Basics",
      "Cloud Computing",
      "Computer Networks",
    ];
    
    courses.forEach((course) => {
      expect(screen.getByText(course)).toBeInTheDocument();
    });
  });

  test("filters courses based on search input", () => {
    render(<Courses />);

    const searchInput = screen.getByPlaceholderText("Search for a course...");
    
    fireEvent.change(searchInput, { target: { value: "web" } });

    // Check that only "Web Development" is displayed
    expect(screen.getByText("Web Development")).toBeInTheDocument();
    expect(screen.queryByText("Introduction to Programming")).not.toBeInTheDocument();
  });

  test("shows 'No courses found' when there is no match", () => {
    render(<Courses />);

    const searchInput = screen.getByPlaceholderText("Search for a course...");
    
    // Type "xyz" in the search box (no matching course)
    fireEvent.change(searchInput, { target: { value: "xyz" } });

    // Check that "No courses found" is displayed
    expect(screen.getByText("No courses found")).toBeInTheDocument();
  });
});