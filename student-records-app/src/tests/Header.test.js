import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import Header from "../Header";

// Mocking the `localStorage` functionality for testing purposes
beforeEach(() => {
  jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
  delete window.location;
  window.location = { href: '' };
});
afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks(); // Clean up spies
  });

test("renders Header with student role", async () => {
    localStorage.setItem("role", "student");
  render(<Header />);

  // Check if 'Werkday' is rendered
  expect(screen.getByText("Werkday")).toBeInTheDocument();

  // Open the menu
  const menuButton = screen.getByTestId("menu-button");
  fireEvent.click(menuButton);

  // Wait for the dropdown to appear
  await waitFor(() => expect(screen.getByText("Home")).toBeInTheDocument());
  expect(screen.getByText("Financial Dashboard")).toBeInTheDocument();
  expect(screen.getByText("Academic Dashboard")).toBeInTheDocument();
  expect(screen.getByText("Personal Information")).toBeInTheDocument();
  expect(screen.getByText("Logout")).toBeInTheDocument();
});

test("renders Header with admin role", async () => {
  // Change the role to "admin" in localStorage for this test
  localStorage.setItem("role", "admin");

  render(<Header />);

  // Open the menu
  const menuButton = screen.getByTestId("menu-button");
  fireEvent.click(menuButton);

  // Wait for the dropdown to appear with admin-specific items
  await waitFor(() => expect(screen.getByText("Home")).toBeInTheDocument());
  expect(screen.getByText("Course Management")).toBeInTheDocument();
  expect(screen.getByText("Grade Management")).toBeInTheDocument();
  expect(screen.getByText("Student Search")).toBeInTheDocument();
  expect(screen.getByText("Student Ranking")).toBeInTheDocument();
  expect(screen.getByText("Lookup Student")).toBeInTheDocument();
  expect(screen.getByText("Add Fee")).toBeInTheDocument();
  expect(screen.getByText("Manage Students")).toBeInTheDocument();
  expect(screen.getByText("Logout")).toBeInTheDocument();
});

test("renders Header with no role (guest)", async () => {
  
    render(<Header />);
  
    // Open the menu
    const menuButton = screen.getByTestId("menu-button");
    fireEvent.click(menuButton);
  
    // Wait for the dropdown to appear with the login button
    const loginButton = await screen.findByText("Login"); // Wait for the Login button
    expect(loginButton).toBeInTheDocument();
  });
  

test("logout button removes role and redirects", async () => {
    localStorage.setItem("role", "student");
  render(<Header />);

  // Open the menu
  const menuButton = screen.getByTestId("menu-button");
  fireEvent.click(menuButton);

  // Click on the logout button
  const logoutButton = screen.getByText("Logout");
  fireEvent.click(logoutButton);

  // Check that localStorage.removeItem was called
  expect(localStorage.removeItem).toHaveBeenCalledWith("role");
  expect(localStorage.removeItem).toHaveBeenCalledWith("student_id");
  expect(localStorage.removeItem).toHaveBeenCalledWith("username");

  // Check if the window is redirected to the home page
  expect(window.location.href).toBe("/");
});

test("menu button toggles the menu visibility", async () => {
    localStorage.setItem("role", "student");
  render(<Header />);

  const menuButton = screen.getByTestId("menu-button");

  // Initially, menu should be closed
  expect(screen.queryByTestId("logged-student-open")).not.toBeInTheDocument();

  // Open the menu
  fireEvent.click(menuButton);
  await waitFor(() => expect(screen.getByTestId("logged-student-open")).toBeInTheDocument());

  // Close the menu
  fireEvent.click(menuButton);
  expect(screen.queryByTestId("logged-student-open")).not.toBeInTheDocument();
});
