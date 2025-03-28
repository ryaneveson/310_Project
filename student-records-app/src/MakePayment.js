import React, { useState, useEffect } from "react";
import axios from "axios";
import "./frontend/makePayment.css";

const formatCardNumber = (cardNumber) => `**** **** **** ${cardNumber.slice(-4)}`;

const FinancialSummary = ({ financialInfo, paymentAmount, setPaymentAmount, handleBlur }) => (
  <div className="amount">
    <p>Total Tuition: ${financialInfo.totalFees.toFixed(2)}</p>
    <p>Amount Paid: ${financialInfo.amountPaid.toFixed(2)}</p>
    <p>Remaining Balance: ${financialInfo.remainingBalance.toFixed(2)}</p>

    <label htmlFor="payment-amount">Payment amount:</label>
    <div className="input-container">
      <span>$</span>
      <input
        type="text"
        id="payment-amount"
        className="currency-input"
        placeholder="0.00"
        value={paymentAmount}
        onChange={(e) => {
          let value = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
          setPaymentAmount(value);
        }}
        onBlur={handleBlur}
        max={financialInfo.remainingBalance}
      />
    </div>
  </div>
);

const CardVerification = ({ method, setNumVer, setCvvVer, setExpVer }) => (
  <div id="card-verification">
    <br></br><label>
      Enter full card number:<br></br>
      <input
        type="text"
        placeholder="XXXX XXXX XXXX XXXX"
        className="payment-method-input"
        onChange={(e) => setNumVer(e.target.value === method.cardNumber)}
      />
    </label><br></br>
    <label>
      Enter CVV:<br></br>
      <input
        type="text"
        placeholder="CVV"
        className="payment-method-input"
        onChange={(e) => setCvvVer(e.target.value === method.cvv)}
      />
    </label><br></br>
    <label>
      Enter Expiry:<br></br>
      <input
        type="text"
        placeholder="MM/YY"
        className="payment-method-input"
        onChange={(e) => setExpVer(e.target.value === method.expiryDate)}
      />
    </label>
  </div>
);

const PaymentMethod = ({ billingMethods, selectedMethod, setSelectedMethod, selectedCardNumber, setSelectedCardNumber, setNumVer, setCvvVer, setExpVer }) => (
  <div className="box-container">
    {billingMethods.length === 0 ? (
      <p>No Billing Methods. Please Add a New One.</p>
    ) : (
      billingMethods.map((method, index) => (
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
          {selectedMethod && selectedCardNumber === method.cardNumber && (
            <CardVerification
              method={method}
              setNumVer={setNumVer}
              setCvvVer={setCvvVer}
              setExpVer={setExpVer}
            />
          )}
        </label>
      ))
    )}

    <div className="billing-box add-payment">
      <a href="/addPaymentMethod">Add New Payment Method</a>
    </div>
  </div>
);

const usePaymentData = (setUserRole, setFinancialInfo, setBillingMethods, setLoading) => {
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
        await axios.post(`http://localhost:5000/api/update-student-fees?student_id=${studentId}`);

        const financeResponse = await axios.get(
          `http://localhost:5000/api/student/finances?student_id=${studentId}`
        );
        const financeData = financeResponse.data.finances;

        let totalFees = financeData.reduce((sum, item) => sum + item.amount, 0);
        let totalPaid = financeData.filter(item => item.item_name === "payment").reduce((sum, item) => sum + item.amount, 0);
        let remainingBalance = totalFees - totalPaid;

        setFinancialInfo({ totalFees, amountPaid: totalPaid, remainingBalance });

        const methodsResponse = await axios.get(
          `http://localhost:5000/api/student/payment_methods?student_id=${studentId}`
        );
        setBillingMethods(
          methodsResponse.data.payment_methods.map(method => ({
            cardType: method.card_type,
            cardNumber: method.card_number,
            cardholderName: method.card_name,
            billingAddress: method.card_address,
            expiryDate: method.expiry_date,
            cvv: method.cvv
          }))
        );
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Error loading payment information.");
        setLoading(false);
      }
    };

    if (studentId) fetchData();
  }, []);
};

function MakePayment() {
  const [userRole, setUserRole] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedCardNumber, setSelectedCardNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [billingMethods, setBillingMethods] = useState([]);
  const [financialInfo, setFinancialInfo] = useState({ totalFees: 0, amountPaid: 0, remainingBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [numVer, setNumVer] = useState(false);
  const [cvvVer, setCvvVer] = useState(false);
  const [expVer, setExpVer] = useState(false);

  usePaymentData(setUserRole, setFinancialInfo, setBillingMethods, setLoading);

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
      await axios.post("http://localhost:5000/api/make-payment", {
        student_id: studentId,
        amount: parseFloat(paymentAmount),
        payment_method: selectedMethod
      });

      alert(`Payment of $${paymentAmount} confirmed using ${selectedMethod} (${selectedCardNumber})`);
      window.location.href = "/Finances";
    } catch (error) {
      console.error("Payment error:", error);
      alert("Error processing payment. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container" id="makePayment">
      <h2>Make a Payment</h2>
      <FinancialSummary financialInfo={financialInfo} paymentAmount={paymentAmount} setPaymentAmount={setPaymentAmount} handleBlur={handleBlur} />
      <h2>Choose a payment method:</h2>
      <form onSubmit={handleSubmit}>
        <PaymentMethod billingMethods={billingMethods} selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} selectedCardNumber={selectedCardNumber} setSelectedCardNumber={setSelectedCardNumber} setNumVer={setNumVer} setCvvVer={setCvvVer} setExpVer={setExpVer} />
        <button type="submit" className="confirm-button" disabled={financialInfo.remainingBalance <= 0}>Confirm Payment</button>
      </form>
    </div>
  );
}

export default MakePayment;
