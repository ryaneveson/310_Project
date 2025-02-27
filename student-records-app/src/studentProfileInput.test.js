import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';
import StudentProfileInput from './studentProfileInput';

test('renders StudentProfileInput component', () => {
  render(
    <MemoryRouter>
      <StudentProfileInput />
    </MemoryRouter>
  );

  // Check if the header text is rendered
  expect(screen.getByText('Search for a Student Profile')).toBeInTheDocument();

  // Check if the input and button are rendered
  expect(screen.getByPlaceholderText('Enter Student ID')).toBeInTheDocument();
  expect(screen.getByText('Go to Profile')).toBeInTheDocument();
});

test('navigates to student profile on submit', () => {
  const { container } = render(
    <MemoryRouter>
      <StudentProfileInput />
    </MemoryRouter>
  );

  const input = screen.getByPlaceholderText('Enter Student ID');
  const button = screen.getByText('Go to Profile');

  // Simulate user input
  fireEvent.change(input, { target: { value: '123' } });
  fireEvent.click(button);

  // Check if the URL is updated
  expect(container.innerHTML).toMatch('/studentProfile/123');
});

test('shows alert for empty student ID', () => {
  window.alert = jest.fn(); // Mock alert

  render(
    <MemoryRouter>
      <StudentProfileInput />
    </MemoryRouter>
  );

  const button = screen.getByText('Go to Profile');

  // Simulate button click without entering student ID
  fireEvent.click(button);

  // Check if alert is shown
  expect(window.alert).toHaveBeenCalledWith('Please enter a student ID.');
});