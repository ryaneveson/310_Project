import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MakePayment from "./MakePayment";

// mocking the alert function to test if it's called
global.alert = jest.fn();

describe("MakePayment Component", () => {
  beforeEach(() => {
    render(<MakePayment />);
  });

  it("should render the payment amount input", () => {
    const paymentInput = screen.getByPlaceholderText("0.00");
    expect(paymentInput).toBeInTheDocument();
  });

  it("should format the payment amount correctly", () => {
    const paymentInput = screen.getByPlaceholderText("0.00");
    
    // simulate typing an invalid value
    fireEvent.change(paymentInput, { target: { value: "123.456" } });
    expect(paymentInput.value).toBe("123.45");

    // simulate typing another valid value
    fireEvent.change(paymentInput, { target: { value: "50" } });
    expect(paymentInput.value).toBe("50.00");
  });

  it("should display billing methods correctly", () => {
    const visaCard = screen.getByText("Visa");
    const masterCard = screen.getByText("MasterCard");

    expect(visaCard).toBeInTheDocument();
    expect(masterCard).toBeInTheDocument();
  });

  it("should allow selecting a payment method", () => {
    const visaRadioButton = screen.getAllByTestId("billing-method-input")[0]
    const masterCardRadioButton = screen.getAllByTestId("billing-method-input")[1];

    fireEvent.click(visaRadioButton);
    expect(visaRadioButton.checked).toBe(true);
    expect(masterCardRadioButton.checked).toBe(false);

    fireEvent.click(masterCardRadioButton);
    expect(visaRadioButton.checked).toBe(false);
    expect(masterCardRadioButton.checked).toBe(true);
  });

  it("should show an alert if the form is submitted without selecting a payment method", () => {
    const submitButton = screen.getByText("Confirm Payment");
    
    // simulate submitting the form without selecting a payment method
    fireEvent.click(submitButton);
    expect(global.alert).toHaveBeenCalledWith("Please select a payment method.");
  });

  it("should show an alert if the payment amount is not entered or is zero", () => {
    const visaRadioButton = screen.getAllByTestId("billing-method-input")[0];
    const submitButton = screen.getByText("Confirm Payment");

    fireEvent.click(visaRadioButton);

    // simulate submitting the form with no payment amount
    fireEvent.click(submitButton);
    expect(global.alert).toHaveBeenCalledWith("Please enter a valid payment amount greater than $0.");

    // simulate submitting the form with an invalid payment amount (0)
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "0" } });
    fireEvent.click(submitButton);
    expect(global.alert).toHaveBeenCalledWith("Please enter a valid payment amount greater than $0.");
  });

  it("should show a success alert with the payment details when valid input is provided", () => {
    const visaRadioButton = screen.getAllByTestId("billing-method-input")[0];
    const submitButton = screen.getByText("Confirm Payment");

    fireEvent.click(visaRadioButton);
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "100" } });

    fireEvent.click(submitButton);
    expect(global.alert).toHaveBeenCalledWith("Payment of $100.00 confirmed using Visa (**** **** **** 1234)");
  });
});
