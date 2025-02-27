import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

test('renders AdminDashboard for admin role', () => {
  localStorage.setItem('role', 'admin');

  render(<Dashboard />);

  // this is to check if the admin page is loaded
  expect(screen.getByText('Hi There Admin')).toBeInTheDocument();
  expect(screen.getByText('Logout')).toBeInTheDocument();
});

test('renders StudentDashboard for student role', () => {
  // this is here to set the role to student now
  localStorage.setItem('role', 'student');

  render(<Dashboard />);

  // this is the test ofr student dashboard
  expect(screen.getByText('Hello, Student!')).toBeInTheDocument();
  expect(screen.getByText('Logout')).toBeInTheDocument();
});

test('redirects to login page if no role is set', () => {
// this is to remove the roles
  localStorage.removeItem('role');

  delete window.location;
  window.location = { href: '' };

  render(<Dashboard />);

  // this is to check if the login is rendered
  expect(window.location.href).toBe('/');
});