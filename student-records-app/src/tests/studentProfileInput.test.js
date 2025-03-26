import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentProfileInput from '../studentProfileInput';

test('renders StudentProfileInput component', () => {
  localStorage.setItem("role","admin");
  render(<StudentProfileInput />);

  // Check if the header text is rendered
  expect(screen.getByText(/Student Profile Search/i)).toBeInTheDocument();
 
  // Check if the input and button are rendered
  expect(screen.getByPlaceholderText('Enter Student ID')).toBeInTheDocument();
  expect(screen.getByText(/View Profile/i)).toBeInTheDocument();
});

test('navigates to student profile on submit', () => {
  localStorage.setItem("role","admin");
  delete window.location;
  window.location = { pathname: "" };
  render(<StudentProfileInput />);

  const input = screen.getByPlaceholderText('Enter Student ID');
  const button = screen.getByLabelText(/View Profile/i);

  // Simulate user input
  fireEvent.change(input, { target: { value: '10000001' } });
  fireEvent.click(button);

  // Check if the URL is updated
  expect(window.location.href).toBe("/studentProfile/10000001");
});

test('shows alert for empty student ID', () => {
  window.alert = jest.fn(); // Mock alert
  localStorage.setItem("role","admin");

  render(<StudentProfileInput />);

  const button = screen.getByLabelText(/View Profile/i);

  // Simulate button click without entering student ID
  fireEvent.click(button);

  // Check if alert is shown
  expect(window.alert).toHaveBeenCalledWith('Please enter a student ID.');
});