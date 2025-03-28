import React, { useState, useEffect } from "react";
import axios from "axios";
import "./frontend/makePayment.css";

function MakePayment() {
  const [userRole, setUserRole] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedCardNumber, setSelectedCardNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [billingMethods, setBillingMethods] = useState([]);
  const [financialInfo, setFinancialInfo] = useState({
    totalFees: 0,
    amountPaid: 0,
    remainingBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [numVer, setNumVer] = useState(false);
  const [cvvVer, setCvvVer] = useState(false);
  const [expVer, setExpVer] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const studentId = localStorage.getItem("student_id");
    
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);

    const fetchData = async () => {
      try {
        // Update and fetch fees
        await axios.post(`http://localhost:5000/api/update-student-fees?student_id=${studentId}`);
        

        const financeResponse = await axios.get(`http://localhost:5000/api/student/finances?student_id=${studentId}`);
        const financeData = financeResponse.data.finances;

        // Calculate next payment due and last payment
        let totalFees = 0;
        let totalPaid = 0;
        let remainingBalance = 0;

        financeData.forEach(item => {
          totalFees += item.amount;
          if (item.item_name === "payment") {
            totalPaid += item.amount;
          }
        });
        remainingBalance = totalFees - totalPaid;
        
        setFinancialInfo({
          totalFees: totalFees,
          amountPaid: totalPaid,
          remainingBalance: remainingBalance
        });

        // Fetch payment methods
        const methodsResponse = await axios.get(
          `http://localhost:5000/api/student/payment_methods?student_id=${studentId}`
        );
        const paymentData = methodsResponse.data.payment_methods;
        
        const formattedPaymentMethods = paymentData.map(method => ({
          cardType: method.card_type,
          cardNumber: method.card_number,
          cardholderName: method.card_name,
          billingAddress: method.card_address,
          expiryDate: method.expiry_date,
          cvv: method.cvv
        }));
        
        setBillingMethods(formattedPaymentMethods);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err.response ? err.response.data : err.message);
        alert("Error loading payment information.");
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    }
  }, []);

  const validateCurrencyInput = (event) => {
    let value = event.target.value;
    value = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    value = value.replace(/^0+(\d)/, "$1");
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const studentId = localStorage.getItem("student_id");
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        alert("Please enter a valid payment amount greater than $0.");
        return;
    }
    
    if (!selectedMethod) {
        alert("Please select a payment method.");
        return;
    }
    
    if (!numVer || !cvvVer || !expVer) {
        const tempInputDiv = document.getElementById("temp-input");
        if (tempInputDiv && !tempInputDiv.querySelector(".error-message")) {
            tempInputDiv.innerHTML += "<p class='error-message' style='color: red;'>Invalid card details. Please check your input.</p>";
        }
        return;
    }

    try {
        console.log("Submitting payment:", {
            student_id: studentId,
            amount: parseFloat(paymentAmount),
            payment_method: selectedMethod
        });

        // First update the student's paid amount
        const updateResponse = await axios.post("http://localhost:5000/api/make-payment", {
            student_id: studentId,
            amount: parseFloat(paymentAmount),
            payment_method: selectedMethod
        });

        if (updateResponse.data.error) {
            throw new Error(updateResponse.data.error);
        }

        alert(`Payment of $${paymentAmount} confirmed using ${selectedMethod} (${selectedCardNumber})`);
        window.location.href = "/Finances";
    } catch (error) {
        console.error("Payment error:", error);
        alert("Error processing payment. Please try again.");
    }
  };

  function formatCardNumber(cardNumber) {
    const cardArray = cardNumber.split(' ');
    const lastFour = cardArray[3]; 
    return '**** **** **** ' + lastFour;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container" id="makePayment">
      <h2>Make a Payment</h2>
      <div className="amount">
        <p>Total Tuition: ${financialInfo.totalFees.toFixed(2)}</p>
        <p>Amount Paid: ${financialInfo.amountPaid.toFixed(2)}</p>
        <p>Remaining Balance: ${financialInfo.remainingBalance.toFixed(2)}</p>
        
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
            max={financialInfo.remainingBalance}
          />
        </div>
      </div>

      <h2>Choose a payment method: </h2>
      <form onSubmit={handleSubmit}>
        <div className="box-container">
  {billingMethods.length === 0 ? (
    <p>No Billing Methods. Please Add a New One.</p>
  ) : (
    billingMethods.map((method, index) => (
      <label key={index} className="billing-box radio-option" data-testid="MakePayment-option">
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
          <div id="temp-input">
            <label>
              Enter full card number:<br />
              <input
                type="text"
                placeholder="XXXX XXXX XXXX XXXX"
                className="payment-method-input"
                onChange={(e) => setNumVer(e.target.value === method.cardNumber)}
              />
            </label>
            <label>
              Enter CVV:<br />
              <input
                type="text"
                placeholder="CVV"
                className="payment-method-input"
                onChange={(e) => setCvvVer(e.target.value === method.cvv)}
              />
            </label>
            <label>
              Enter Expiry:<br />
              <input
                type="text"
                placeholder="MM/YY"
                className="payment-method-input"
                onChange={(e) => setExpVer(e.target.value === method.expiryDate)}
              />
            </label>
          </div>
        )}
      </label>
    ))
  )}


          <div className="billing-box add-payment">
            <a href="/addPaymentMethod">Add New Payment Method</a>
          </div>
        </div>

        <button 
          type="submit" 
          className="confirm-button"
          disabled={financialInfo.remainingBalance <= 0}
        >
          Confirm Payment
        </button>
      </form>
    </div>
  );
}

export default MakePayment;
