import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Courses from "../Courses";

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

  beforeEach(() => {
    // Mock fetch for course registration
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Success" })
      })
    );
  });

  test("renders the component with all courses", () => {
    render(<Courses mockCourses={courses} />);
    expect(screen.getByText("Available Courses")).toBeInTheDocument();
    
    // Check for each course using the full course name format
    courses.forEach(course => {
      const fullCourseName = `${course.dept} ${course.courseNum} - ${course.name}`;
      expect(screen.getByText(fullCourseName)).toBeInTheDocument();
    });
  });

  test("filters courses based on search input", async () => {
    render(<Courses mockCourses={courses} />);
    const searchInput = screen.getByPlaceholderText("Search for a course...");
    
    fireEvent.change(searchInput, { target: { value: "intro" } });
    
    // Check that only the Introduction course is visible
    expect(screen.getByText(/COSC 101 - Introduction to Programming/)).toBeInTheDocument();
    expect(screen.queryByText(/COSC 310 - Software Engineering/)).not.toBeInTheDocument();
  });

  test("shows 'No courses found' when there is no match", () => {
    render(<Courses mockCourses={courses} />);
    const searchInput = screen.getByPlaceholderText("Search for a course...");
    fireEvent.change(searchInput, { target: { value: "xyz" } });
    expect(screen.getByText("No courses found")).toBeInTheDocument();
  });

  test("registers for a course and redirects", async () => {
    // Mock window.location
    const mockLocation = { href: "" };
    delete window.location;
    window.location = mockLocation;

    render(<Courses mockCourses={courses} />);

    // Click the first Register button
    const registerButtons = screen.getAllByText("Register");
    fireEvent.click(registerButtons[0]);

    // Wait for the redirect
    await waitFor(() => {
      expect(window.location.href).toBe("/academicdashboard");
    }, { timeout: 3000 });

    // Verify fetch was called
    expect(fetch).toHaveBeenCalled();
  });

  test("filters courses by year selection", async () => {
    render(<Courses mockCourses={courses} />);
    
    const year1Checkbox = screen.getByLabelText("100 Level");
    fireEvent.click(year1Checkbox);

    // Check that only 100-level courses are visible
    expect(screen.getByText(/COSC 101 - Introduction to Programming/)).toBeInTheDocument();
    expect(screen.queryByText(/COSC 310 - Software Engineering/)).not.toBeInTheDocument();
  });
});
