import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateUser from './createUser';
import '@testing-library/jest-dom';

describe('CreateUser Component', () => {
  global.fetch = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders initial student verification form', () => {
    render(<CreateUser />);
    
    // check to see if student verification form elements are present
    expect(screen.getByText('Create Student Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Student ID')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify Student ID' })).toBeInTheDocument();
  });

  test('shows error when student ID is empty', async () => {
    render(<CreateUser />);
    
    // try to submit without student ID
    const verifyButton = screen.getByRole('button', { name: 'Verify Student ID' });
    fireEvent.click(verifyButton);
    
    expect(screen.getByText('Please enter a student ID')).toBeInTheDocument();
  });

  test('shows registration form after successful verification', async () => {
    //  successful verification response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );

    render(<CreateUser />);
    
    // submit verification form
    const studentIdInput = screen.getByPlaceholderText('Student ID');
    fireEvent.change(studentIdInput, { target: { value: '12345678' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify Student ID' }));

    // wait for registration form to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Choose a username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Choose a password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });
  });

  test('handles failed student verification', async () => {
    // failed verification response
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ 
          success: false, 
          error: 'Student ID not found' 
        })
      })
    );

    render(<CreateUser />);
    
    // Fill and submit verification form
    const studentIdInput = screen.getByPlaceholderText('Student ID');
    fireEvent.change(studentIdInput, { target: { value: 'invalid_id' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify Student ID' }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Student ID not found')).toBeInTheDocument();
    });
  });

  test('login link exists', () => {
    render(<CreateUser />);
    
    const loginLink = screen.getByText('Login here');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.getAttribute('href')).toBe('/');
  });
});