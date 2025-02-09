import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StudentSearch from "./StudentSearch";

describe("StudentSearch Component", () => {
    test("renders without crashing", () => {
        render(<StudentSearch />);
        expect(screen.getByText("Search for a student:")).toBeInTheDocument();
        expect(screen.getByText("Filtered Students:")).toBeInTheDocument();
    });

    test("filters students by first name, last name and student number search", () => {
        render(<StudentSearch />);
        
        const searchInput = screen.getByPlaceholderText("Search for a student...");

        fireEvent.change(searchInput, { target: { value: "Alice" } });
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.queryByText("Bob")).not.toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: "Moore" } });
        expect(screen.getByText("Grade")).toBeInTheDocument();
        expect(screen.queryByText("Bob")).not.toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: "8" } });
        expect(screen.getByText("Hannah")).toBeInTheDocument();
        expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    });
    
    test("filters students by GPA range", () => {
        render(<StudentSearch />);

        const minGpaInput = screen.getByPlaceholderText("0");
        const maxGpaInput = screen.getByPlaceholderText("100");
        
        fireEvent.change(minGpaInput, { target: { value: "80" } });
        fireEvent.change(maxGpaInput, { target: { value: "90" } });
        
        expect(screen.queryByText("Alice")).toBeInTheDocument(); // Alice has 85 gpa
        expect(screen.queryByText("Bob")).not.toBeInTheDocument(); // Bob has 72 gpa
        expect(screen.queryByText("Eva")).not.toBeInTheDocument();// Eva has 92 gpa
    });

    test("filters students by selected classes", () => {
        render(<StudentSearch />);
        
        const mathCheckbox = screen.getByLabelText("Math 101");
        fireEvent.click(mathCheckbox);
        
        expect(screen.getByText("Alice")).toBeInTheDocument(); // Alice is in math 101
        expect(screen.getByText("Eva")).not.toBeInTheDocument(); // Eva is not in math 101
    });

    test("toggles sidebar visibility", () => {
        render(<StudentSearch />);

        expect(screen.queryByText("Art 101")).toBeInTheDocument();
        const toggleButton = screen.queryByText("Collapse");
        fireEvent.click(toggleButton);
        expect(screen.queryByText("Art 101")).not.toBeInTheDocument();
        expect(screen.queryByText("Expand")).toBeInTheDocument();
        fireEvent.click(toggleButton);
        expect(screen.queryByText("Art 101")).toBeInTheDocument();
    });
});
