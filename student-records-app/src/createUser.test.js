import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateUser from './createUser';
import '@testing-library/jest-dom';

describe('CreateUser Component', () => {
  // Mock fetch before tests
  global.fetch = jest.fn();

  beforeEach(() =>  {
    fetch.mockClear();
  });

  test('renders form elements', () => {
    render(<CreateUser />);
    
    // Check if all form elements are present
    expect(screen.getAllByText('Create Account')).toHaveLength(2);
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  test('handles user input', () => {
    render(<CreateUser />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });

  test('shows success message on successful registration', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'User created successfully!' })
      })
    );

    render(<CreateUser />);
    
    // Fill and submit form
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'testpass' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('User created successfully! You can now log in.')).toBeInTheDocument();
    });
  });

  test('shows error message when registration fails', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Username already exists' })
      })
    );

    render(<CreateUser />);
    
    // Fill and submit form
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'existinguser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'testpass' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });
});