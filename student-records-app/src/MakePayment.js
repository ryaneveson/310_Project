import React, { useEffect, useState } from "react";
import "./makePayment.css";

function MakePayment() {
  const [htmlContent, setHtmlContent] = useState("");
  const billingMethods = [
    {cardType: "Visa", cardNumber: "**** **** **** 1234", cardholderName: "John Doe", billingAddress: "123 Main St, City, Country",},
    {cardType: "MasterCard", cardNumber: "**** **** **** 5678", cardholderName: "Jane Smith", billingAddress: "456 Elm St, City, Country",},
  ];

  // Function to validate currency input
  const validateCurrencyInput = (event) => {
    let input = event.target;
    input.value = input.value
      .replace(/[^0-9.]/g, "") // Allow only numbers and dots
      .replace(/(\..*)\./g, "$1") // Prevent multiple dots
      .replace(/^0+(\d)/, "$1") // Prevent leading zeros
      .replace(/^(\d*\.\d{2}).*/, "$1"); // Allow only two decimal places
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
            {/* Attach the validateCurrencyInput function directly */}
            <input type="text" id="payment-amount" className="currency-input" placeholder="0.00" onInput={validateCurrencyInput} />
        </div>
      </div>
      <h2>Choose a payment method: </h2>
      <div className="box-container">
        {/* Dynamically generate billing method boxes */}
        {billingMethods.map((method, index) => (
          <div key={index} className="billing-box">
            <h3>{method.cardType}</h3>
            <p>{method.cardNumber}</p>
            <p>{method.cardholderName}</p>
            <p>{method.billingAddress}</p>
          </div>
        ))}

        {/* Extra box with a link */}
        <div className="billing-box add-payment">
          <a href="/finances">Add New Payment Method</a>
        </div>
      </div>
    </div>
  );
}

export default MakePayment;
