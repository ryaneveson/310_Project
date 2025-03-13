import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Finances from './Finances';
import EditGrades from './editGrades';

describe('Role-Based Access Control', () => {
    beforeEach(() => {
        localStorage.clear();
        delete window.location;
        window.location = { href: jest.fn()  };
    });

    test('denies admin access to financial dashboard', async () => {
        localStorage.setItem('role', 'admin');
        render(<Finances />);
        await screen.findByText(/Access Denied/i);
        expect(screen.getByText(/Access Denied/i)).toBeInTheDocument(); 
    });

    test('denies student access to grade editing', () => {
        localStorage.setItem('role', 'student');
        render(<EditGrades />);
        expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    });

    test('allows admin access to grade editing', () => {
        localStorage.setItem('role', 'admin');
        render(<EditGrades />);
        expect(screen.getByText(/Grade Management/i)).toBeInTheDocument();
    });

    test('redirects to login when no role is set', () => {
        render(<Finances />);
        expect(window.location.href).toBe('/');
    });
}); 