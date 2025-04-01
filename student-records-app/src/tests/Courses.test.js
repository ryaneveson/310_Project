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
const originalLocation = window.location;

beforeAll(() => {
window.alert = jest.fn();
// Create a simple location mock
delete window.location;
window.location = { href: '' };
});

afterAll(() => {
// Restore the original location
window.location = originalLocation;
});

beforeEach(() => {
// Reset location.href before each test
window.location.href = '';
// Mock fetch with more detailed response
global.fetch = jest.fn(() =>
Promise.resolve({
ok: true,
json: () => Promise.resolve({ 
success: true,
message: "Successfully registered for course" 
})
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

test("handles course registration successfully", async () => {
render(<Courses mockCourses={courses} />);

// Click the first Register button
const registerButtons = screen.getAllByText("Register");
fireEvent.click(registerButtons[0]);

// Verify that fetch was called with correct course
await waitFor(() => {
expect(fetch).toHaveBeenCalled();
});

// Verify the fetch call parameters
expect(fetch).toHaveBeenCalledWith(
expect.any(String), // URL
expect.objectContaining({
method: 'POST',
headers: expect.any(Object),
body: expect.any(String)
})
);
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