// AddPaymentMethod.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddPaymentMethod from "./addPaymentMethod"; // Adjust path if needed

describe("AddPaymentMethod", () => {
  test("renders form fields correctly", () => {
    render(<AddPaymentMethod />);

    // Check if the form elements are rendered
    expect(screen.getByLabelText(/Payment Method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Card Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expiry Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CVV/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Billing Address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Payment Method/i })).toBeInTheDocument();
  });

  test("validates form submission with required fields", async () => {
    render(<AddPaymentMethod />);

    // Find form fields
    const paymentMethodSelect = screen.getByLabelText(/Payment Method/i);
    const cardNumberInput = screen.getByLabelText(/Card Number/i);
    const expiryDateInput = screen.getByLabelText(/Expiry Date/i);
    const cvvInput = screen.getByLabelText(/CVV/i);
    const billingAddressInput = screen.getByLabelText(/Billing Address/i);
    const submitButton = screen.getByRole("button", { name: /Add Payment Method/i });

    // Simulate user input
    fireEvent.change(paymentMethodSelect, { target: { value: "Visa" } });
    fireEvent.change(cardNumberInput, { target: { value: "1234567812345678" } });
    fireEvent.change(expiryDateInput, { target: { value: "2025-12" } });
    fireEvent.change(cvvInput, { target: { value: "123" } });
    fireEvent.change(billingAddressInput, { target: { value: "123 Main St" } });

    // Test if the console.log was called (Mocking console.log)
    const mockConsole = jest.spyOn(console, "log");

    // Simulate form submission
    fireEvent.click(submitButton);

    // Wait for the form to process and check if values are logged or submitted
    await waitFor(() => {
      expect(screen.queryByText(/Payment Method:/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockConsole).toHaveBeenCalledWith({
        paymentMethod: "Visa",
        cardNumber: "1234567812345678",
        expiryDate: "2025-12",
        cvv: "123",
        billingAddress: "123 Main St",
      });
    });
  });

  test("form fields are required", async () => {
    render(<AddPaymentMethod />);

    // Find submit button and click it without filling out the form
    const submitButton = screen.getByRole("button", { name: /Add Payment Method/i });
    fireEvent.click(submitButton);

    // Ensure the form is not submitted without required fields
    await waitFor(() => {
      expect(screen.getByLabelText(/Payment Method/i)).toHaveAttribute("required");
      expect(screen.getByLabelText(/Card Number/i)).toHaveAttribute("required");
      expect(screen.getByLabelText(/Expiry Date/i)).toHaveAttribute("required");
      expect(screen.getByLabelText(/CVV/i)).toHaveAttribute("required");
      expect(screen.getByLabelText(/Billing Address/i)).toHaveAttribute("required");
    });
  });
});
