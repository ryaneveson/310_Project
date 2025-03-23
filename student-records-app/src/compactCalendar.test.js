import React from 'react';
import { render, screen } from '@testing-library/react';
import Calendar from './Calendar';

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
    // Mock axios to prevent actual API calls
    jest.mock('axios');
  });

  test('renders in compact mode with correct styling', () => {
    render(<Calendar mockEvents={mockEvents} compact={true} />);
    
    // Check if calendar container has compact class
    const container = screen.getByTestId('calendar-container');
    expect(container).toHaveClass('calendar-compact');
  });

  test('displays correct days of the week', () => {
    render(<Calendar mockEvents={mockEvents} compact={true} />);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  test('renders mock events correctly', () => {
    render(<Calendar mockEvents={mockEvents} compact={true} />);
    
    // Check if both classes are displayed
    expect(screen.getByText(/COSC 310/)).toBeInTheDocument();
    expect(screen.getByText(/COSC 304/)).toBeInTheDocument();
    
    // Check if room numbers are displayed
    expect(screen.getByText(/EME 1202/)).toBeInTheDocument();
    expect(screen.getByText(/SCI 200/)).toBeInTheDocument();
  });

  test('displays correct time slots', () => {
    render(<Calendar mockEvents={mockEvents} compact={true} />);
    
    // Check for some time slots
    expect(screen.getByText('8:00')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('16:00')).toBeInTheDocument();
  });

  test('handles empty events array', () => {
    render(<Calendar mockEvents={[]} compact={true} />);
    
    // Calendar should still render without events
    expect(screen.getByText('No courses scheduled')).toBeInTheDocument();
  });

  test('event blocks have correct positioning', () => {
    render(<Calendar mockEvents={mockEvents} compact={true} />);
    
    const eventBlocks = screen.getAllByTestId('event-block');
    
    // First event (Monday 9:30-11:00)
    expect(eventBlocks[0]).toHaveStyle({
      top: '90px',  // (9.5 - 8) * 40 + 30
      height: '60px',  // (11 - 9.5) * 40
      left: '160px'  // (1 + 1) * 100 + 60
    });

    // Second event (Wednesday 14:00-15:30)
    expect(eventBlocks[1]).toHaveStyle({
      top: '270px',  // (14 - 8) * 40 + 30
      height: '60px',  // (15.5 - 14) * 40
      left: '360px'  // (3 + 1) * 100 + 60
    });
  });
});
