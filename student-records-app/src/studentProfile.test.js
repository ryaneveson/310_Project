import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentProfile from './studentProfile';
import axios from 'axios';

jest.mock('axios');

const dummyData = {
  student_id: "10000001",
  first_name: "John",
  last_name: "Jover",
  email: "johnjover@johnmail.com",
  gender: "Male",
  registered_courses: ["Course 1", "Course 2", "Course 3", "Course 4"],
  registered_courses_grades: [85, 82, 77, 91],
  completed_courses: ["Course 5", "Course 6"],
  completed_courses_grades: [88, 92],
  degree: "B.Sc.",
  major: "Computer Science",
  gpa: 83.8
};

const mockFetchStudentProfile = (studentData = dummyData) => {
  axios.get.mockResolvedValueOnce({
    data: {
      student: studentData
    }
  });
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('StudentProfile Component', () => {
  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the student profile when data is fetched successfully', async () => {
    mockFetchStudentProfile();
    render(<StudentProfile />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Student Profile')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jover')).toBeInTheDocument();
      expect(screen.getByText('johnjover@johnmail.com')).toBeInTheDocument();
      expect(screen.getByText('Male')).toBeInTheDocument();
      expect(screen.getByText('B.Sc.')).toBeInTheDocument();
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
      expect(screen.getByText('83.8')).toBeInTheDocument(); // GPA formatted
    });
  });

  it('renders the "Completed Courses" table correctly', async () => {
    mockFetchStudentProfile();
    render(<StudentProfile />);
    await waitFor(() => {
      expect(screen.getByText('Completed Courses')).toBeInTheDocument();
      expect(screen.getByText('Course 5')).toBeInTheDocument();
      expect(screen.getByText('88')).toBeInTheDocument();
      expect(screen.getByText('Course 6')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
    });
  });

  it('displays a message when there are no completed courses', async () => {
    const noCompletedCoursesData = {
      ...dummyData,
      completed_courses: [],
      completed_courses_grades: []
    };
    mockFetchStudentProfile(noCompletedCoursesData);
    render(<StudentProfile />);
    await waitFor(() => {
      expect(screen.getByText('Completed Courses')).toBeInTheDocument();
      expect(screen.queryByText('Course 5')).not.toBeInTheDocument();
      expect(screen.queryByText('88')).not.toBeInTheDocument();
      expect(screen.getByText('This student has not completed any courses')).toBeInTheDocument();
    });
  });

  it('shows an error message if the student profile is not found', async () => {
    mockFetchStudentProfile(null);
    render(<StudentProfile />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Student not found.')).toBeInTheDocument();
    });
  });

  it('allows editing of student profile', async () => {
    mockFetchStudentProfile();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
    render(<StudentProfile />);
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });
    const changeButton = screen.getByText('Change Info');
    fireEvent.click(changeButton);
    expect(screen.getByText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Email/i)).toBeInTheDocument();
    const firstNameInput = screen.getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.click(screen.getByText('Set Info'));
    axios.post.mockResolvedValueOnce({ data: { message: 'Student updated successfully' } });
    await waitFor(() =>
          expect(window.alert).toHaveBeenCalledWith("Student updated successfully.")
    );
  });

  it('handles form validation errors during editing', async () => {
    mockFetchStudentProfile();
    render(<StudentProfile />);
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });
    const changeButton = screen.getByText('Change Info');
    fireEvent.click(changeButton);
    const firstNameInput = screen.getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: '' } });
    fireEvent.click(screen.getByText('Set Info'));
    await waitFor(() => {
      expect(screen.getByText('Can not be empty')).toBeInTheDocument();
    });
  });





  it('navigates to the correct profile when a valid student ID is entered', async () => {
    render(<StudentProfile />);
    const input = screen.getByPlaceholderText('Enter Student ID');
    const button = screen.getByText('Search for a Different Student');

    // Simulate entering a valid student ID
    fireEvent.change(input, { target: { value: '10000002' } });
    fireEvent.click(button);

    // Expect the window location to change to the new profile URL
    await waitFor(() => {
      expect(window.location.href).toContain('/studentProfile/10000002');
    });
  });

  it('shows an alert when the search button is clicked without entering a student ID', async () => {
    render(<StudentProfile />);
    const button = screen.getByText('Search for a Different Student');

    // Simulate clicking the button without entering a student ID
    fireEvent.click(button);

    // Expect an alert to be shown
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Please enter a student ID.');
    });
  });

  it('renders the search button with correct text and styling', async () => {
    render(<StudentProfile />);
    
    // Verify the button is in the document
    const button = screen.getByText('Search for a Different Student');
    expect(button).toBeInTheDocument();
  
    // Verify the button has the correct class
    expect(button).toHaveClass('search-button');
  
    // Verify the button has the correct attributes
    expect(button).toHaveAttribute('id', 'profileInput-submit');
    expect(button).toHaveAttribute('type', 'button');
  });
});
