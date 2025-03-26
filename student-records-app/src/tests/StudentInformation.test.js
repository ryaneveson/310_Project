import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import StudentInformation from '../AdminPages/StudentInfo';

// Mock axios
jest.mock('axios');

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('StudentInformation Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === 'username') return 'testUser';
            if (key === 'role') return 'student';
            return null;
        });
    });

    test('displays current username and edit button', async () => {
        render(<StudentInformation />);
        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });
        expect(screen.getByText("Username")).toBeInTheDocument();
        expect(screen.getByText('Edit Information')).toBeInTheDocument();
    });

    test('redirects to login if no username in localStorage', () => {
        mockLocalStorage.getItem.mockImplementation(() => null);
        
        delete window.location;
        window.location = { href: '' };
        
        render(<StudentInformation />);
        expect(window.location.href).toBe('/');
    });
}); 