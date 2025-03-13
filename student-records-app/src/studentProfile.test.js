import React from 'react';
import { render, screen } from '@testing-library/react';
import StudentProfile from './studentProfile';
import axios from 'axios';

//mock axios for pulling from database
jest.mock('axios');

//updated test to pull from database
test('renders StudentProfile component', async () => {
  window.history.pushState({}, 'Test Page', '/studentProfile/10000001');
  axios.get.mockResolvedValue({
    data: {
      name: 'John Jover',
      student_id: '10000001',
      major: 'Computer Science'
    }
  });

  render(<StudentProfile />);

  // Check if the header text is rendered
  expect(screen.getByText('Student Profile')).toBeInTheDocument();

  // Wait for the student data to be rendered
  await waitFor(() => {
    expect(screen.getByText('Name: John Jover')).toBeInTheDocument();
    expect(screen.getByText('ID: 10000001')).toBeInTheDocument();
    expect(screen.getByText('Major: Computer Science')).toBeInTheDocument();
  });
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