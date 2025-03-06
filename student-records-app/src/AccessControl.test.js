import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Finances from './Finances';
import EditGrades from './EditGrades';

describe('Role-Based Access Control', () => {
    beforeEach(() => {
        localStorage.clear();
        delete window.location;
        window.location = { href: jest.fn() };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Financial Dashboard Access', () => {
        test('denies admin access to financial dashboard', () => {
            localStorage.setItem('role', 'admin');
            render(
                <Router>
                    <Finances />
                </Router>
            );

            expect(screen.getByText('Access Denied')).toBeInTheDocument();
            expect(screen.getByText('This page is only accessible to students.')).toBeInTheDocument();
            expect(screen.queryByText('Financial Dashboard')).not.toBeInTheDocument();
        });

        test('allows student access to financial dashboard', () => {
            localStorage.setItem('role', 'student');
            render(
                <Router>
                    <Finances />
                </Router>
            );

            expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
            expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
            // Check for specific financial content
            expect(screen.getByText('Current Balance')).toBeInTheDocument();
            expect(screen.getByText('Payment History')).toBeInTheDocument();
        });

        test('redirects to login when no role is set', () => {
            render(
                <Router>
                    <Finances />
                </Router>
            );

            expect(window.location.href).toBe('/');
        });
    });

    describe('Grade Management Access', () => {
        test('denies student access to grade editing', () => {
            localStorage.setItem('role', 'student');
            render(
                <Router>
                    <EditGrades />
                </Router>
            );

            expect(screen.getByText('Access Denied')).toBeInTheDocument();
            expect(screen.getByText('This page is only accessible to administrators.')).toBeInTheDocument();
            expect(screen.queryByText('Grade Management')).not.toBeInTheDocument();
        });

        test('allows admin access to grade editing', () => {
            localStorage.setItem('role', 'admin');
            render(
                <Router>
                    <EditGrades />
                </Router>
            );

            expect(screen.getByText('Grade Management')).toBeInTheDocument();
            expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
            // Check for specific grade management content
            expect(screen.getByText('Student Grades')).toBeInTheDocument();
            expect(screen.getByText('Save Changes')).toBeInTheDocument();
        });

        test('redirects to login when no role is set', () => {
            render(
                <Router>
                    <EditGrades />
                </Router>
            );

            expect(window.location.href).toBe('/');
        });
    });

    describe('Error Messages', () => {
        test('displays appropriate error message for unauthorized admin access', () => {
            localStorage.setItem('role', 'admin');
            render(
                <Router>
                    <Finances />
                </Router>
            );

            const errorMessage = screen.getByText('This page is only accessible to students.');
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveStyle({ color: 'red' });
        });

        test('displays appropriate error message for unauthorized student access', () => {
            localStorage.setItem('role', 'student');
            render(
                <Router>
                    <EditGrades />
                </Router>
            );

            const errorMessage = screen.getByText('This page is only accessible to administrators.');
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveStyle({ color: 'red' });
        });
    });

    describe('Logout Functionality', () => {
        test('logout button is present and functional in restricted pages', () => {
            localStorage.setItem('role', 'student');
            render(
                <Router>
                    <EditGrades />
                </Router>
            );

            const logoutButton = screen.getByText('Logout');
            expect(logoutButton).toBeInTheDocument();
            
            // Click logout button
            logoutButton.click();
            
            // Verify logout effects
            expect(localStorage.getItem('role')).toBeNull();
            expect(window.location.href).toBe('/');
        });
    });
}); 