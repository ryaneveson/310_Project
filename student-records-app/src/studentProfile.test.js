import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudentProfile from './studentProfile';

test('renders StudentProfile component', () => {
  render(
    <MemoryRouter initialEntries={['/studentProfile/2']}>
      <Routes>
        <Route path="/studentProfile/:studentID" element={<StudentProfile />} />
      </Routes>
    </MemoryRouter>
  );

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

  render(
    <MemoryRouter initialEntries={['/studentProfile/999']}>
      <Routes>
        <Route path="/studentProfile/:studentID" element={<StudentProfile />} />
        <Route path="/studentProfileInput" element={<div>Student Profile Input Page</div>} />
      </Routes>
    </MemoryRouter>
  );

  // Check if alert is shown
  expect(window.alert).toHaveBeenCalledWith('Student ID does not exist.');

  // Check if redirected to StudentProfileInput page
  expect(screen.getByText('Student Profile Input Page')).toBeInTheDocument();
});