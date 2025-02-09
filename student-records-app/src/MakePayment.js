import React, { useState } from "react";
import "./makePayment.css";

function MakePayment() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedCardNumber, setSelectedCardNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const billingMethods = [
    {cardType: "Visa", cardNumber: "**** **** **** 1234", cardholderName: "John Doe", billingAddress: "123 Main St, City, Country",},
    {cardType: "MasterCard", cardNumber: "**** **** **** 5678", cardholderName: "Jane Smith", billingAddress: "456 Elm St, City, Country",},
  ];

  // function to validate currency input
  const validateCurrencyInput = (value) => {
    let formattedValue = value
      .replace(/[^0-9.]/g, "") // allow only numbers and dots
      .replace(/(\..*)\./g, "$1") // prevent multiple dots
      .replace(/^0+(\d)/, "$1") // prevent leading zeros
      .replace(/^(\d*\.\d{2}).*/, "$1"); // allow only two decimal places
      if (!isFocused && formattedValue && !formattedValue.includes(".")) {
        formattedValue = parseFloat(formattedValue).toFixed(2);
      }
    return formattedValue;
  };

  const handleFocus = () => {
    setIsFocused(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
    let formattedAmount = validateCurrencyInput(paymentAmount);
    if (formattedAmount && !formattedAmount.includes(".")) {
      formattedAmount = parseFloat(formattedAmount).toFixed(2);
    }
    setPaymentAmount(formattedAmount);
  };

  const handleInput = (event) => {
    const value = validateCurrencyInput(event.target.value);
    setPaymentAmount(value); // real-time input update without validation
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedMethod) {
      alert("Please select a payment method.");
      return;
    }
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount greater than $0.");
      return;
    }
    alert(`Payment of $${paymentAmount} confirmed using ${selectedMethod} (${selectedCardNumber})`);
  };

  return (
    <div className="container" id="makePayment">
      <h2>How much to Pay: </h2>
      <div className="amount">
        <p>Amount due in next 30 days: </p>
        <p>Total amount due: </p>
        <label htmlFor="payment-amount">Payment amount: </label>
        <div className="input-container">
          <span>$</span>
          <input
            type="text"
            id="payment-amount"
            className="currency-input"
            placeholder="0.00"
            onChange={handleInput} // update the value in real-time
            value={paymentAmount}
            onBlur={handleBlur} // validate when the cursor leaves the input field
            onFocus={handleFocus}
          />
        </div>
      </div>

      <h2>Choose a payment method: </h2>
      <form onSubmit={handleSubmit}>
        <div className="box-container">
          {billingMethods.map((method, index) => (
            <label key={index} className="billing-box radio-option" htmlFor={`billing-method-${method.cardType}`}>
              <input
                type="radio"
                name="billingMethod"
                id={`billing-method-${method.cardType}`}
                value={method.cardType}
                data-testid="billing-method-input"
                onChange={() => {
                  setSelectedMethod(method.cardType);
                  setSelectedCardNumber(method.cardNumber);
                }}
              />
              <div>
                <h3>{method.cardType}</h3>
                <p>{method.cardNumber}</p>
                <p>{method.cardholderName}</p>
                <p>{method.billingAddress}</p>
              </div>
            </label>
          ))}

          <div className="billing-box add-payment">
            <a href="/finances">Add New Payment Method</a>
          </div>
        </div>

        <button type="submit" className="confirm-button">Confirm Payment</button>
      </form>
    </div>
  );
}

export default MakePayment;
