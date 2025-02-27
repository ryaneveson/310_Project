import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

test('renders AdminDashboard for admin role', () => {
  // Set role to admin in localStorage
  localStorage.setItem('role', 'admin');

  render(<Dashboard />);

  // Check if the AdminDashboard is rendered
  expect(screen.getByText('Hi There')).toBeInTheDocument();
  expect(screen.getByText('Logout')).toBeInTheDocument();
});

test('renders StudentDashboard for student role', () => {
  // Set role to student in localStorage
  localStorage.setItem('role', 'student');

  render(<Dashboard />);

  // Check if the StudentDashboard is rendered
  expect(screen.getByText('Hello, Student!')).toBeInTheDocument();
  expect(screen.getByText('Logout')).toBeInTheDocument();
});

test('redirects to login page if no role is set', () => {
  // Remove role from localStorage
  localStorage.removeItem('role');

  // Mock window.location.href
  delete window.location;
  window.location = { href: '' };

  render(<Dashboard />);

  // Check if the user is redirected to the login page
  expect(window.location.href).toBe('/');
});