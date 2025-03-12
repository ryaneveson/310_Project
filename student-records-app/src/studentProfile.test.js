import React from 'react';
import { render, screen } from '@testing-library/react';
import StudentProfile from './studentProfile';

test('renders StudentProfile component', () => {
  window.history.pushState({}, 'Test Page', '/studentProfile/2');
  render(<StudentProfile />);

  // Check if the header text is rendered
  expect(screen.getByText('Student Profile')).toBeInTheDocument();

  // Check if the student data is rendered
  expect(screen.getByText('Name: John Jover')).toBeInTheDocument();
  expect(screen.getByText('ID: 2')).toBeInTheDocument();
  expect(screen.getByText('Major: Computer Science')).toBeInTheDocument();
  expect(screen.getByText('GPA: 98')).toBeInTheDocument();
});

test('redirects to StudentProfileInput for invalid ID', () => {
  window.alert = jest.fn(); // Mock alert
  localStorage.setItem("role", "student");
  delete window.location;
  window.location = { pathname: "/studentProfileInput" };
  window.history.replaceState({}, 'Test Page', '/studentProfile');
  render(<StudentProfile />);

  //check if alert is shown
  expect(window.alert).toHaveBeenCalledWith('Student ID does not exist.');

  //check if redirected to StudentProfileInput page
  expect(window.location.pathname).toBe("/studentProfileInput");
});