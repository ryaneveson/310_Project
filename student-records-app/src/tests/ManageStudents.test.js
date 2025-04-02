import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageStudents from '../ManageStudents';

const mockStudents = [
  {
    name: "Alice",
    lastName: "Smith",
    studentNumber: "1001",
    gpa: 3.9,
    classes: ["COMP 101", "MATH 202"]
  },
  {
    name: "Bob",
    lastName: "Johnson",
    studentNumber: "1002",
    gpa: 3.5,
    classes: ["COMP 101"]
  }
];

beforeEach(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '' }
  });
  localStorage.setItem('role', 'admin');
});

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

test('renders ManageStudents component with mock students', async () => {
  render(<ManageStudents mockStudents={mockStudents} />);
  expect(screen.getByText(/Filtered Students/i)).toBeInTheDocument();
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.getByText('Bob')).toBeInTheDocument();
});

test('filters students by search term', async () => {
  render(<ManageStudents mockStudents={mockStudents} />);
  const input = screen.getByPlaceholderText(/search for a student/i);
  fireEvent.change(input, { target: { value: 'Alice' } });
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.queryByText('Bob')).not.toBeInTheDocument();
});

test('clears search field on clear button click', async () => {
  render(<ManageStudents mockStudents={mockStudents} />);
  const input = screen.getByPlaceholderText(/search for a student/i);
  fireEvent.change(input, { target: { value: 'Alice' } });
  expect(input.value).toBe('Alice');
  fireEvent.click(screen.getByText(/Clear/i));
  expect(input.value).toBe('');
});

test('selects and deletes all students', async () => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
    );
    render(<ManageStudents mockStudents={mockStudents} />);
    fireEvent.click(screen.getAllByText(/Select Student/i)[0]);
    fireEvent.click(screen.getByText(/Delete Selected Students/i));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Students deleted successfully."));
});

test("allows adding new student", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
    window.alert = jest.fn();
    render(<ManageStudents mockStudents={mockStudents} />);
    fireEvent.change(screen.getByPlaceholderText("Students Firstname . . ."), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Students Lastname . . ."), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("example@gmail.com"), {
      target: { value: "john.doe@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText(/Gender:/i), {
        target: { value: "Male" },
    });
    fireEvent.change(screen.getByPlaceholderText("Students Degree . . ."), {
        target: { value: "Bs.c" },
    });
    fireEvent.change(screen.getByPlaceholderText("Students Major . . ."), {
        target: { value: "Bio" },
    });
    fireEvent.click(screen.getByText("Submit New Student"));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Student added successfully.")
    );
  });

test('renders access denied for non-admin user', async () => {
  localStorage.setItem('role', 'student');
  render(<ManageStudents mockStudents={mockStudents} />);
  expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  expect(screen.getByText(/only accessible to administrators/i)).toBeInTheDocument();
});

test('redirects to login if no role in localStorage', async () => {
  localStorage.removeItem('role');
  render(<ManageStudents mockStudents={mockStudents} />);
  await waitFor(() => {
    expect(window.location.href).toBe('/');
  });
});
