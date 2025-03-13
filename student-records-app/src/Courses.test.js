import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Courses from "./Courses";

const courses = [
  {
    courseNum: "310",
    date: "Mon-Wed 9:30-11:00",
    dept: "COSC",
    name: "Software Engineering",
    prerequisites: "COSC 121",
    professor: "Gema Rodriguez-Perez",
    room: "ART 103"
  },
  {
    courseNum: "220",
    date: "Tue-Thu 10:00-11:30",
    dept: "COSC",
    name: "Data Structures",
    prerequisites: "COSC 121",
    professor: "James Smith",
    room: "CS 202"
  },
  {
    courseNum: "405",
    date: "Mon-Wed 13:00-14:30",
    dept: "COSC",
    name: "Machine Learning",
    prerequisites: "COSC 310",
    professor: "Emily Johnson",
    room: "CS 301"
  },
  {
    courseNum: "101",
    date: "Mon-Wed 8:00-9:30",
    dept: "COSC",
    name: "Introduction to Programming",
    prerequisites: "None",
    professor: "Michael Lee",
    room: "CS 100"
  },
  {
    courseNum: "425",
    date: "Tue-Thu 15:00-16:30",
    dept: "COSC",
    name: "Computer Graphics",
    prerequisites: "COSC 221",
    professor: "Sarah Chen",
    room: "CS 402"
  }
];




describe("Courses Component", () => {

  beforeAll(() => {
    window.alert = jest.fn();
  });

  test("renders the component with all courses", () =>  {
    render(<Courses mockCourses={courses}/>);

    expect(screen.getByText("Available Courses")).toBeInTheDocument();
    
    courses.forEach(async (course) => {
      await screen.findByText(course.name);
      expect(screen.getByText(course.name)).toBeInTheDocument();
    });
  });

  test("filters courses based on search input", async () => {
    render(<Courses mockCourses={courses}/>);

    const searchInput = screen.getByPlaceholderText("Search for a course...");
    
    fireEvent.change(searchInput, { target: { value: "intro" } });

    await screen.findByText(/101 - Introduction to Programming/i);
    expect(screen.getByText(/101 - Introduction to Programming/i)).toBeInTheDocument();
    expect(screen.queryByText(/310 - Software Engineering/i)).not.toBeInTheDocument();
  });

  test("shows 'No courses found' when there is no match", () => {
    render(<Courses mockCourses={courses}/>);

    const searchInput = screen.getByPlaceholderText("Search for a course...");
    fireEvent.change(searchInput, { target: { value: "xyz" } });

    expect(screen.getByText("No courses found")).toBeInTheDocument();
  });

  test("registers for a course and redirects", async () => {
    delete window.location; // Necessary to override in Jest
    window.location = { href: "" };
    render(<Courses mockCourses={courses}/>);

    //simulate the user clicking the "Register" button for the first course
    const registerButton = screen.getAllByText(/Register/i)[0];
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(window.location.href).toBe("/academicdashboard");
    });
  });

  test("filters courses by year selection", async () => {
    render(<Courses mockCourses={courses}/>);

    const year1Checkbox = screen.getByLabelText("100 Level");
    fireEvent.click(year1Checkbox);
    await screen.findByText(/101 - Introduction to Programming/i);
    expect(screen.getByText(/101 - Introduction to Programming/i)).toBeInTheDocument();
    expect(screen.queryByText(/310 - Software Engineering/i)).not.toBeInTheDocument();
  });
});
