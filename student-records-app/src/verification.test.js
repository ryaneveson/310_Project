import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Courses from "./Courses"; 
import VerifyRegistration from "./VerifyRegistration"; 

describe("Verifying Registration", () => {

  beforeEach(() => {
    delete window.location; // Necessary to override in Jest
    window.location = { href: "" };
    localStorage.removeItem("registeredCourses");
    render(<Courses />);
    const registerButton = screen.getAllByText("Register")[0];
    fireEvent.click(registerButton);
  });

  afterEach(() => {
    localStorage.removeItem("registeredCourses");
  })

//this is a test to make sure that the course is added when you click add course
  test("should add a course when Register button is clicked", () => {
    render(<Courses />);
    const registerButton = screen.getAllByText("Register")[0];
    fireEvent.click(registerButton);

    render(<VerifyRegistration />);

    expect(screen.getAllByRole("cname")[0]).toBeInTheDocument();
  });
//this is the test to make sure that the course is removed if you click remove.
  test("should remove a course when Remove button is clicked", async () => {

    render(<VerifyRegistration />);

    expect(screen.getAllByRole("cname")[0]).toBeInTheDocument();

    const removeButton = screen.getAllByRole("remove-course")[0];
    fireEvent.click(removeButton);

    expect(!localStorage.getItem("registeredCourses"));
  });

  test("should navigate to courses page when Add More Courses button is clicked", () => {
    render(<VerifyRegistration />);

    const addMoreCoursesButton = screen.getByText("Add More Courses");
    fireEvent.click(addMoreCoursesButton);

    expect(window.location.href).toBe("/courses");
  });

  test("should proceed to checkout when Finalize Registration button is clicked", () => {
    render(<VerifyRegistration />);

    const proceedButton = screen.getByText("Finalize Registration");
    
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    
    fireEvent.click(proceedButton);

    expect(screen.getByText("Successfully registered!")).toBeInTheDocument();
  });

  test("should go back to the previous page when Go Back button is clicked", () => {
    //document.referrer = "/courses";
    render(<VerifyRegistration />);

    const goBackButton = screen.getByText("Go Back");
    fireEvent.click(goBackButton);

    
    expect(window.location.href).toBe("/courses");
  });

  test("should show 'No courses registered' message when no courses are registered", () => {
    localStorage.removeItem("registeredCourses");
    render(<VerifyRegistration />);

    expect(screen.getByText("No courses registered")).toBeInTheDocument();
  });

  test("should navigate to /courses page when Add Courses button is clicked", () => {
    localStorage.removeItem("registeredCourses");
    render(<VerifyRegistration />);

    const addCoursesButton = screen.getByText("Add Courses");
    fireEvent.click(addCoursesButton);

    expect(window.location.href).toBe("/courses");
  });
});
