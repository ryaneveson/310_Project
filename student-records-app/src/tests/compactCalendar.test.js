import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompactCalendar from '../Calendar';
import axios from 'axios';

// Mock the useUser hook
jest.mock('../utils/useUser', () => ({
  __esModule: true,
  default: () => ({
    userRole: 'student',
    loading: false,
    handleLogout: jest.fn(),
    setLoading: jest.fn()
  })
}));

// Mock axios
jest.mock('axios');

describe('Calendar Component (Compact View)', () => {
  const mockEvents = [
    {
      day: "Monday",
      startTime: "9:30",
      endTime: "11:00",
      classCode: "COSC 310",
      room: "EME 1202"
    },
    {
      day: "Wednesday",
      startTime: "14:00",
      endTime: "15:30",
      classCode: "COSC 304",
      room: "SCI 200"
    }
  ];

  beforeEach(() => {
    localStorage.setItem("role", "student");
    localStorage.setItem("student_id", "test123");
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders in compact mode with correct styling', () => {
    render(<CompactCalendar mockEvents={mockEvents} compact={true} />);
    
    const container = screen.getByTestId('calendar-container');
    expect(container).toHaveClass('calendar-compact');
  });

  test('displays correct days of the week', () => {
    render(<CompactCalendar mockEvents={mockEvents} compact={true} />);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  test('renders mock events correctly', () => {
    render(<CompactCalendar mockEvents={mockEvents} compact={true} />);
    
    expect(screen.getByText(/COSC 310/)).toBeInTheDocument();
    expect(screen.getByText(/COSC 304/)).toBeInTheDocument();
    expect(screen.getByText(/EME 1202/)).toBeInTheDocument();
    expect(screen.getByText(/SCI 200/)).toBeInTheDocument();
  });

  test('displays correct time slots', () => {
    render(<CompactCalendar mockEvents={mockEvents} compact={true} />);
    
    // Check for time slots with the correct format
    expect(screen.getByText('8:00')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('16:00')).toBeInTheDocument();
  });

  test('handles empty events array', () => {
    render(<CompactCalendar mockEvents={[]} compact={true} />);
    
    expect(screen.getByText('No courses scheduled')).toBeInTheDocument();
  });
});
