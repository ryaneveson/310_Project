import React, { useState } from "react";
import "./makePayment.css";

function MakePayment() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedCardNumber, setSelectedCardNumber] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("");
  
  const billingMethods = [
    {cardType: "Visa", cardNumber: "**** **** **** 1234", cardholderName: "John Doe", billingAddress: "123 Main St, City, Country",},
    {cardType: "MasterCard", cardNumber: "**** **** **** 5678", cardholderName: "Jane Smith", billingAddress: "456 Elm St, City, Country",},
  ];

  // Function to validate currency input
  const validateCurrencyInput = (event) => {
    let input = event.target;
    let value = input.value
      .replace(/[^0-9.]/g, "") // Allow only numbers and dots
      .replace(/(\..*)\./g, "$1") // Prevent multiple dots
      .replace(/^0+(\d)/, "$1") // Prevent leading zeros
      .replace(/^(\d*\.\d{2}).*/, "$1"); // Allow only two decimal places
    if (value && !value.includes(".")) {
      value = parseFloat(value).toFixed(2);
    }
    setPaymentAmount(value);
  };

  const handleBlur = () => {
    if (paymentAmount && !isNaN(paymentAmount)) {
      setPaymentAmount(parseFloat(paymentAmount).toFixed(2));
    }
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
            onInput={validateCurrencyInput}
          />
        </div>
      </div>

      <h2>Choose a payment method: </h2>
      <form onSubmit={handleSubmit}>
        <div className="box-container">
          {billingMethods.map((method, index) => (
            <label key={index} className="billing-box radio-option">
              <input
                type="radio"
                name="billingMethod"
                value={method.cardType}
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
