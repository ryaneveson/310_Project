import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Finances from '../Finances';
import EditGrades from '../editGrades';

describe('Role-Based Access Control', () => {
    beforeEach(() => {
        localStorage.clear();
        delete window.location;
        window.location = { href: jest.fn()  };
    });

    test('denies student access to grade editing', () => {
        localStorage.setItem('role', 'student');
        render(<EditGrades />);
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    test('allows admin access to grade editing', () => {
        localStorage.setItem('role', 'admin');
        render(<EditGrades />);
        expect(screen.getByText('Grade Management')).toBeInTheDocument();
    });

    test('redirects to login when no role is set', () => {
        render(<Finances />);
        expect(window.location.href).toBe('/');
    });

    test('logout functionality works', () => {
        localStorage.setItem('role', 'student');
        render(<EditGrades />);
        
        fireEvent.click(screen.getByText('Logout'));
        expect(localStorage.getItem('role')).toBeNull();
        expect(window.location.href).toBe('/'); 
    });
}); 