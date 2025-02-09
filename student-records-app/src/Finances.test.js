import React from "react";
import { render, screen, within } from "@testing-library/react";
import Finances from "./Finances";

const testBillingMethods = [
    { "Card Type": "Visa", "Card Number": "**** **** **** 1234", "Cardholder Name": "John Doe", "Billing Address": "123 Main St, City, Country" },
    { "Card Type": "MasterCard", "Card Number": "**** **** **** 5678", "Cardholder Name": "Jane Smith", "Billing Address": "456 Elm St, City, Country" }
  ];

const testItemsDue = [
    ["course1", "500", "Jan 1"],
    ["course2", "500", "Jan 1"],
    ["fees", "250", "Sept 1"]
  ];

// mock useEffect behavior to control test data
test("renders financial dashboard", () => {
  render(<Finances />);

  // check if the financial dashboard title is present
  expect(screen.getByText(/Financial Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Current Account Balance:/i)).toBeInTheDocument();
  expect(screen.getByText(/Amount due in next 30 days:/i)).toBeInTheDocument();
  expect(screen.getByText(/Total future amount due:/i)).toBeInTheDocument();

  // check links
  expect(screen.getByText(/Pay Tuition/i)).toHaveAttribute("href", "/makePayment");
  expect(screen.getByText(/Change financial information/i)).toHaveAttribute("href", "/finances");
});

test("renders billing methods correctly", () => {//make sure the data is together in the same table as the other data it belongs with
    render(<Finances />);
  
    const billingHeaders = screen.getAllByRole("heading", { level: 4, name: /Billing Method \d+/i });
    const billingTables = billingHeaders.map(header => header.closest("div").querySelector("table"));
  
    for (let methodIndex = 0; methodIndex < testBillingMethods.length; methodIndex++) {
      const method = testBillingMethods[methodIndex];
      const tableRows = billingTables[methodIndex].querySelectorAll("tr");
      
      let rowIndex = 0;
      for (const [key, value] of Object.entries(method)) {
        const tableRow = tableRows[rowIndex];
        expect(within(tableRow).getByText(key)).toBeInTheDocument();
        expect(within(tableRow).getByText(value)).toBeInTheDocument();
        rowIndex++;
      }
    }
  });

test("renders future items due", () => {
    render(<Finances />);
  
    // get the futureItemsDue table
    const dueTable = screen.getByText(/Future Items Due/i).closest("div")?.querySelector("table tbody");
  
    expect(dueTable).not.toBeNull(); // ensure the table exists before proceeding
    testItemsDue.forEach((row, rowIndex) => {
      const tableRows = dueTable.querySelectorAll("tr");
      expect(tableRows.length).toBeGreaterThan(rowIndex); // ensure row exists
      const tableRow = tableRows[rowIndex];
      row.forEach((cell) => {
        expect(within(tableRow).getByText(cell)).toBeInTheDocument();//make sure the data is in the row expected
      });
    });
});

test("boxes are not overlapping or off-screen", () => {
    render(<Finances />);

    const boxes = screen.getAllByRole("region");

    boxes.forEach((box) => { // boxes are not off the screen
      const rect = box.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
    });
    boxes.forEach((boxA, index) => { // ensure boxes are not overlapping
        const rectA = boxA.getBoundingClientRect();
        boxes.forEach((boxB, j) => {
          if (index !== j) { // compare different boxes
            const rectB = boxB.getBoundingClientRect();
            expect(
              rectA.right <= rectB.left || rectA.left >= rectB.right || 
              rectA.bottom <= rectB.top || rectA.top >= rectB.bottom
            ).toBe(true);
          }
        });
    });
});
  