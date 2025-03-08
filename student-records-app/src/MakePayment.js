import React, { useState, useEffect } from "react";
import axios from "axios";
import "./frontend/makePayment.css";

function MakePayment() {
  const [userRole, setUserRole] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedCardNumber, setSelectedCardNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [billingMethods, setBillingMethods] = useState([]);
  const [totalDue, setTotalDue] = useState(null);
  const [next30Due, setNext30Due] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentId = "10000001";

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);

    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/student/payment_methods?student_id=${studentId}`);
        const paymentData = response.data.payment_methods
        const formattedPaymentMethods = paymentData.map(method => ({
          cardType: method.card_type,
          cardNumber: method.card_number,
          cardholderName: method.card_name,
          billingAddress: method.card_address,
          expiryDate: method.expiry_date,
          cvv: method.cvv
        }));
        setBillingMethods(formattedPaymentMethods);

        const response2 = await axios.get(`http://localhost:5000/api/student/finances?student_id=${studentId}`);
        const financeData = response2.data.finances
        let sum = 0
        let sum2 = 0
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        financeData.forEach(item => {
          if (!item.is_paid ) {
            if(item.due_date >= today && item.due_date <= thirtyDaysFromNow){
              sum += item.amount
            }
            sum2 += item.amount;
          }
        });
        setNext30Due(sum);
        setTotalDue(sum2);
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          alert(`Error: ${err.response.data.error}`);
        } else {
          alert("Error fetching payment methods.");
        }
      }
    };
    fetchPaymentMethods();
  }, []);

  if(loading){
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  if (!userRole) {
    return <div>Loading...</div>;
  }

  if (userRole !== "student") {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>This page is only accessible to students.</p>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  // Function to validate currency input
  const validateCurrencyInput = (event) => {
    let value = event.target.value;
    // Remove non-numeric characters except for the first '.'
    value = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    // Prevent multiple leading zeros
    value = value.replace(/^0+(\d)/, "$1");
    // Allow only two decimal places
    const parts = value.split(".");
    if (parts.length === 2) {
      parts[1] = parts[1].slice(0, 2);
      value = parts.join(".");
    }
    setPaymentAmount(value);
  };

  const handleBlur = () => {
    if (paymentAmount) {
      const numericValue = parseFloat(paymentAmount);
      if (!isNaN(numericValue)) {
        setPaymentAmount(numericValue.toFixed(2));
      }
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
    window.location.href = "/Finances";
  };

  function formatCardNumber(cardNumber) {
    const cardArray = cardNumber.split(' ');
    const lastFour = cardArray[3]; 
    return '**** **** **** ' + lastFour;
  }

  return (
    <div className="container" id="makePayment">
      <h2>How much to Pay: </h2>
      <div className="amount">
        <p>Amount due in next 30 days: ${next30Due}</p>
        <p>Total amount due: ${totalDue}</p>
        <label htmlFor="payment-amount">Payment amount: </label>
        <div className="input-container">
          <span>$</span>
          <input
            type="text"
            id="payment-amount"
            className="currency-input"
            placeholder="0.00"
            value={paymentAmount}
            onChange={validateCurrencyInput}
            onBlur={handleBlur}
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
                <p>{formatCardNumber(method.cardNumber)}</p>
                <p>{method.cardholderName}</p>
                <p>{method.billingAddress}</p>
              </div>
              
              {selectedMethod && selectedMethod === method.cardType && (
              <div className="temp-input">
                <input
                  type="text"
                  placeholder="Enter full card number"
                  className="payment-method-input"
                />
                <input
                  type="text"
                  placeholder="Enter CVV"
                  className="payment-method-input"
                />
              </div>
        )}
            </label>
          ))}

          <div className="billing-box add-payment">
            <a href="/addPaymentMethod">Add New Payment Method</a>
          </div>
        </div>

        <button type="submit" className="confirm-button">Confirm Payment</button>
      </form>
    </div>
  );
}


export default MakePayment;
