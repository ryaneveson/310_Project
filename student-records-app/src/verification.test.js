import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Courses from "../Courses"; 
import VerificationPage from "../VerificationPage"; 

describe("Courses Registration", () => {
//this is a test to make sure that the course is added when you click add course
  test("should add a course when Register button is clicked", () => {
    render(
      <MemoryRouter>
        <Courses />
      </MemoryRouter>
    );

    const registerButton = screen.getAllByText("Register")[0];
    fireEvent.click(registerButton);
    render(
      <MemoryRouter>
        <VerificationPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Introduction to Programming")).toBeInTheDocument();
  });
//this is the test to make sure that the course is removed if you click remove.
  test("should remove a course when Remove button is clicked", () => {
    render(
      <MemoryRouter>
        <VerificationPage />
      </MemoryRouter>
    );

    const courseItem = screen.getByText("Introduction to Programming");
    expect(courseItem).toBeInTheDocument();

    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    expect(screen.queryByText("Introduction to Programming")).not.toBeInTheDocument();
  });
});
