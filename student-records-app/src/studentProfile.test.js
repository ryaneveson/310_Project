import React from 'react';
import { render, screen } from '@testing-library/react';
import StudentProfile from './studentProfile';
import axios from 'axios';

//mock axios for pulling from database
jest.mock('axios');

// Dummy data for testing
const dummyData = {
  student_id: "10000001",
  name: "John Jover",
  email: "johnjover@johnmail.com",
  gender: "Male",
  registered_courses: ["Course 1", "Course 2", "Course 3", "Course 4"],
  registered_courses_grades: [85, 82, 77, 91],
  degree: "B.Sc.",
  major: "Computer Science",
  gpa: 83.75
};


test('renders StudentProfile component', async () => {
  window.history.pushState({}, 'Test Page', '/studentProfile/10000001');

  render(<StudentProfile />);

  // Check if the header text is rendered
  expect(screen.getByText('Student Profile')).toBeInTheDocument();

  // Wait for the student data to be rendered
  await waitFor(() => {
    expect(screen.getByText('Name: John Jover')).toBeInTheDocument();
    expect(screen.getByText('ID: 10000001')).toBeInTheDocument();
    expect(screen.getByText('Email: johnjover@johnmail.com')).toBeInTheDocument();
    expect(screen.getByText('Gender: Male')).toBeInTheDocument();
    expect(screen.getByText('Degree: B.Sc.')).toBeInTheDocument();
    expect(screen.getByText('Major: Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Current GPA: 83.75')).toBeInTheDocument();
    expect(screen.getByText('Course 1')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });
});


test('redirects to StudentProfileInput for invalid ID', async () => {
  window.alert = jest.fn(); // Mock alert
  localStorage.setItem("role", "admin");
  delete window.location;
  window.location = { pathname: "/studentProfileInput" };
  window.history.replaceState({}, 'Test Page', '/studentProfile');
  render(<StudentProfile />);

  //check if alert is shown
  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Invalid student ID.');
  });
  
  //check if redirected to StudentProfileInput page
  expect(window.location.pathname).toBe("/studentProfileInput");
});


test('shows loading state initially', () => {
  window.history.pushState({}, 'Test Page', '/studentProfile/10000001');

  render(<StudentProfile />);

  // Check if loading text is rendered
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});


test('handles error fetching student profile', async () => {
  window.alert = jest.fn(); // Mock alert
  axios.get.mockRejectedValue(new Error('Error fetching student profile'));
  window.history.pushState({}, 'Test Page', '/studentProfile/10000001');

  render(<StudentProfile />);

  // Check if alert is shown
  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Error fetching student profile.');
  });

  // Check if redirected to StudentProfileInput page
  expect(window.location.href).toBe('http://localhost/studentProfileInput');
});