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
        expect(screen.getByText("Grace")).toBeInTheDocument();
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
        expect(screen.queryByText("Eva")).not.toBeInTheDocument(); // Eva is not in math 101
    });

    test("toggles sidebar visibility", () => {
        render(<StudentSearch />);

        expect(screen.getByTestId("checkboxes")).toHaveStyle(`height: auto`);
        const toggleButton = screen.getByText("Collapse");
        fireEvent.click(toggleButton);
        expect(screen.getByTestId("checkboxes")).toHaveStyle(`height: 0`);
        expect(screen.getByText("Expand")).toBeInTheDocument();
        fireEvent.click(toggleButton);
        expect(screen.getByTestId("checkboxes")).toHaveStyle(`height: auto`);
    });

    test("clear and reset buttons work correctly", () => {
        render(<StudentSearch />);

        const searchInput = screen.getByPlaceholderText("Search for a student...");
        const minGpaInput = screen.getByPlaceholderText("0");
        const maxGpaInput = screen.getByPlaceholderText("100");
        const clearSearchButton = screen.getByText("Clear");
        const clearMinGpaButton = screen.getAllByTestId("reset")[1];
        const clearMaxGpaButton = screen.getAllByTestId("reset")[0];
        const resetButton = screen.getAllByTestId("reset")[2];
        
        fireEvent.change(searchInput, { target: { value: "Alice" } });
        fireEvent.click(clearSearchButton);
        expect(searchInput.value).toBe("");

        fireEvent.change(minGpaInput, { target: { value: "80" } });
        fireEvent.click(clearMinGpaButton);
        expect(minGpaInput.value).toBe("0");

        fireEvent.change(maxGpaInput, { target: { value: "90" } });
        fireEvent.click(clearMaxGpaButton);
        expect(maxGpaInput.value).toBe("100");

        screen.getAllByRole("checkbox").forEach(checkbox => {
            if (!checkbox.checked) {
                fireEvent.click(checkbox);
            }
        });
        fireEvent.click(resetButton);
        expect(screen.getAllByRole("checkbox").every(checkbox => !checkbox.checked)).toBe(true);
    });

    //I added this test for student profile navigation testing -Jaxon
    test("navigates to student profile on button click", () => {
        render(
                <Routes>
                    <Route path="/studentSearch" element={<StudentSearch />} />
                    <Route path="/studentProfile/:studentID" element={<StudentProfile />} />
                </Routes>
        );

        const goToProfileButton = screen.getAllByText("Go to Profile")[0];
        fireEvent.click(goToProfileButton);

        expect(screen.getByText("Student Profile")).toBeInTheDocument();
    });

});
