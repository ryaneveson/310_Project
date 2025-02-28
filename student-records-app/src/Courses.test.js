import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Courses from "./Courses";

describe("Courses Component", () => {

  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.removeItem("registeredCourses");
  });

  test("renders the component with all courses", () => {
    render(<Courses />);

    expect(screen.getByText("Available Courses")).toBeInTheDocument();

    const courses = [
      "1 Introduction to Programming",
      "2 Data Structures",
      "3 Web Development",
      "4 Database Management",
      "5 Machine Learning"
    ];
    
    courses.forEach((course) => {
      expect(screen.getByText(course)).toBeInTheDocument();
    });
  });

  test("filters courses based on search input", () => {
    render(<Courses />);

    const searchInput = screen.getByPlaceholderText("Search for a course...");
    
    fireEvent.change(searchInput, { target: { value: "web" } });

    expect(screen.getByText("3 Web Development")).toBeInTheDocument();
    expect(screen.queryByText("1 Introduction to Programming")).not.toBeInTheDocument();
  });

  test("shows 'No courses found' when there is no match", () => {
    render(<Courses />);

    const searchInput = screen.getByPlaceholderText("Search for a course...");
    fireEvent.change(searchInput, { target: { value: "xyz" } });

    expect(screen.getByText("No courses found")).toBeInTheDocument();
  });

  test("registers for a course, updates localStorage, and redirects", () => {
    delete window.location; // Necessary to override in Jest
    window.location = { href: "" };
    render(<Courses />);

    //simulate the user clicking the "Register" button for the first course
    const registerButton = screen.getAllByText("Register")[0];
    fireEvent.click(registerButton);

    //check if localStorage is updated with the new course
    const registeredCourses = JSON.parse(localStorage.getItem("registeredCourses"));
    expect(registeredCourses).toHaveLength(1);
    expect(registeredCourses[0].course).toBe("1 Introduction to Programming");

    expect(window.location.href).toBe("/verify-registration");
  });

  test("filters courses by year selection", () => {
    render(<Courses />);

    const year1Checkbox = screen.getByLabelText("Year 1");
    fireEvent.click(year1Checkbox);

    expect(screen.getByText("1 Introduction to Programming")).toBeInTheDocument();
    expect(screen.queryByText("2 Data Structures")).not.toBeInTheDocument();

    fireEvent.click(year1Checkbox);
    expect(screen.getByText("2 Data Structures")).toBeInTheDocument();
  });

  test("prevents registering the same course twice", () => {
    render(<Courses />);

    const registerButton = screen.getAllByText("Register")[0];
    fireEvent.click(registerButton);

    localStorage.setItem(
      "registeredCourses",
      JSON.stringify([{ course: "1 Introduction to Programming" }])
    );

    const duplicateRegisterButton = screen.getAllByText("Register")[0];
    fireEvent.click(duplicateRegisterButton);

    expect(window.alert).toHaveBeenCalledWith("This course is already registered.");
  });
});
