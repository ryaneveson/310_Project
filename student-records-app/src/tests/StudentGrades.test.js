import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentGrades from '../StudentPages/StudentGrades';

// Mock the fetch function
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockStudentData = {
    student: {
        first_name: "Betty",
        last_name: "Spaghetti",
        student_id: "10000004",
        major: "Computer Science",
        registered_courses: ["COSC 310", "COSC 315"],
        registered_courses_grades: ["85", "90"],
        completed_courses: ["COSC 111", "COSC 121"],
        completed_courses_grades: ["88", "92"]
    }
};

describe('StudentGrades Component', () => {
    beforeEach(() => {
        fetch.mockClear();
        mockLocalStorage.getItem.mockClear();
    });

    it('shows loading state initially', () => {
        mockLocalStorage.getItem.mockReturnValue('10000004');
        fetch.mockImplementationOnce(() => new Promise(() => {}));
        
        render(<StudentGrades />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays error when not logged in', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        
        render(<StudentGrades />);
        
        await waitFor(() => {
            expect(screen.getByText('Please log in to view your grades')).toBeInTheDocument();
        });
    });

    it('displays student information and grades when data is loaded', async () => {
        mockLocalStorage.getItem.mockReturnValue('10000004');
        fetch.mockImplementationOnce(() => 
            Promise.resolve({
                json: () => Promise.resolve(mockStudentData)
            })
        );

        render(<StudentGrades />);

        await waitFor(() => {
            // Check student info
            expect(screen.getByText(/Betty Spaghetti/)).toBeInTheDocument();
            expect(screen.getByText(/10000004/)).toBeInTheDocument();
            expect(screen.getByText(/Computer Science/)).toBeInTheDocument();

            // Check current courses
            expect(screen.getByText('COSC 310')).toBeInTheDocument();
            expect(screen.getByText('COSC 315')).toBeInTheDocument();

            // Check completed courses
            expect(screen.getByText('COSC 111')).toBeInTheDocument();
            expect(screen.getByText('COSC 121')).toBeInTheDocument();
        });
    });

    it('handles fetch error gracefully', async () => {
        mockLocalStorage.getItem.mockReturnValue('10000004');
        fetch.mockImplementationOnce(() => 
            Promise.reject(new Error('Failed to fetch'))
        );

        render(<StudentGrades />);

        await waitFor(() => {
            expect(screen.getByText(/Failed to fetch student data/)).toBeInTheDocument();
        });
    });

    it('displays appropriate status badges', async () => {
        mockLocalStorage.getItem.mockReturnValue('10000004');
        fetch.mockImplementationOnce(() => 
            Promise.resolve({
                json: () => Promise.resolve(mockStudentData)
            })
        );

        render(<StudentGrades />);

        await waitFor(() => {
            const currentBadges = screen.getAllByText('Current');
            const completedBadges = screen.getAllByText('Completed');
            
            expect(currentBadges).toHaveLength(2);
            expect(completedBadges).toHaveLength(2);
        });
    });
}); 