import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Finances from "./Finances";

// Mock the useEffect to avoid the need for async data fetching
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useEffect: jest.fn((f) => f()),
}));

describe("Finances Component", () => {
  // Test for rendering the Financial Dashboard
  it("renders Financial Dashboard correctly", () => {
    render(<Finances />);

    expect(screen.getByText("Financial Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Current Account Balance:")).toBeInTheDocument();
    expect(screen.getByText("Amount due in next 30 days:")).toBeInTheDocument(); 
    expect(screen.getByText("Total future amount due:")).toBeInTheDocument();
    expect(screen.getByText("Pay Tuition")).toBeInTheDocument();
    expect(screen.getByText("Change financial information")).toBeInTheDocument();
  });

  // Test for rendering billing methods table using forEach
  it("renders billing methods tables correctly", async () => {
    render(<Finances />);

    const billingMethods = [
      { "Card Type": "Visa", "Card Number": "**** **** **** 1234", "Cardholder Name": "John Doe", "Billing Address": "123 Main St, City, Country" },
      { "Card Type": "MasterCard", "Card Number": "**** **** **** 5678", "Cardholder Name": "Jane Smith", "Billing Address": "456 Elm St, City, Country" }
    ];

    // Wait for billing methods to be populated
    await waitFor(() => {
      billingMethods.forEach((method, index) => {
        //expect(screen.getByText(`Billing Method ${index + 1}`)).toBeInTheDocument();

        Object.entries(method).forEach(([key, value]) => {
          expect(screen.getByText(key.toString())).toBeInTheDocument();
          expect(screen.getByText(value)).toBeInTheDocument();
        });
      });
    });
  });

  // Test for rendering future items due table using forEach
  it("renders future items due table correctly", async () => {
    render(<Finances />);

    const itemsDue = [
      ["course1", "500", "Jan 1"],
      ["course2", "500", "Jan 1"],
      ["fees", "250", "Sept 1"]
    ];

    // Wait for items due to be populated
    await waitFor(() => {
      const itemsTable = screen.getByTestId("items-due");

      itemsDue.forEach((item) => {
        item.forEach((detail) => {
          expect(screen.getByText(detail)).toBeInTheDocument();
        });
      });
    });
  });
});
